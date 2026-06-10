"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notification_service_1 = require("../notification/notification.service");
const crypto = require("crypto");
let PaymentService = class PaymentService {
    constructor(prisma, notificationService) {
        this.prisma = prisma;
        this.notificationService = notificationService;
    }
    async initiatePayHere(bookingId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { customer: true, payment: true },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
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
        return {
            merchantId,
            orderId,
            amount,
            currency,
            hash,
            mode: process.env.PAYHERE_MODE || 'sandbox',
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
    async handleNotify(body) {
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
                this.notificationService.sendBookingConfirmation(booking).catch(() => { });
            }
        }
        return { status: 'ok' };
    }
    async confirmCash(bookingId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { payment: true, customer: true, court: { include: { sports: true } } },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        await this.prisma.payment.update({
            where: { bookingId },
            data: { status: 'PAID', method: 'CASH', paidAt: new Date() },
        });
        const confirmed = await this.prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'CONFIRMED' },
            include: { payment: true, customer: true, court: { include: { sports: true } } },
        });
        this.notificationService.sendBookingConfirmation(confirmed).catch(() => { });
        return confirmed;
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_service_1.NotificationService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map