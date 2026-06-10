import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async initiatePayHere(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true, payment: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    const orderId = booking.bookingRef;
    const amount = Number(booking.totalAmount).toFixed(2);
    const currency = 'LKR';

    const hashStr = `${merchantId}${orderId}${amount}${currency}${crypto
      .createHash('md5')
      .update(merchantSecret)
      .digest('hex')
      .toUpperCase()}`;

    const hash = crypto.createHash('md5').update(hashStr).digest('hex').toUpperCase();

    const mode = process.env.PAYHERE_MODE || 'sandbox';
    const checkoutUrl = mode === 'live'
      ? 'https://www.payhere.lk/pay/checkout'
      : 'https://sandbox.payhere.lk/pay/checkout';

    return {
      merchantId,
      orderId,
      amount,
      currency,
      hash,
      checkoutUrl,
      mode,
      notifyUrl: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/payment/notify`,
      returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/booking/confirm/${booking.bookingRef}`,
      cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/booking`,
      firstName: booking.customer.name.split(' ')[0],
      lastName: booking.customer.name.split(' ').slice(1).join(' ') || '-',
      email: booking.customer.email || 'noemail@example.com',
      phone: booking.customer.phone,
      itemName: `Court Booking - ${booking.bookingRef}`,
    };
  }

  async handleNotify(body: any) {
    const { order_id, status_code } = body;

    if (status_code === '2') {
      const booking = await this.prisma.booking.findUnique({
        where: { bookingRef: order_id },
        include: { payment: true, customer: true, court: { include: { sports: true } } },
      });

      if (booking && booking.payment) {
        await this.prisma.payment.update({
          where: { id: booking.payment.id },
          data: { status: 'PAID', method: 'ONLINE', transactionId: body.payment_id, paidAt: new Date() },
        });

        await this.prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'CONFIRMED' },
        });

        this.notificationService.sendBookingConfirmation(booking).catch(() => {});
      }
    }

    return { status: 'ok' };
  }

  async confirmCash(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true, customer: true, court: { include: { sports: true } } },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    await this.prisma.payment.update({
      where: { bookingId },
      data: { status: 'PAID', method: 'CASH', paidAt: new Date() },
    });

    const confirmed = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
      include: { payment: true, customer: true, court: { include: { sports: true } } },
    });

    this.notificationService.sendBookingConfirmation(confirmed).catch(() => {});
    return confirmed;
  }
}
