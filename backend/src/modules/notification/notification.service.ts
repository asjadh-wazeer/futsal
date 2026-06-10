import { Injectable, Logger } from '@nestjs/common';
import * as dayjs from 'dayjs';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async sendBookingConfirmation(booking: any): Promise<void> {
    const phone = booking.customer?.phone;
    if (!phone) return;

    const whatsappSent = await this.sendWhatsApp(phone, booking);
    if (!whatsappSent) {
      await this.sendSMS(phone, this.buildSmsMessage(booking));
    }
  }

  private async sendWhatsApp(phone: string, booking: any): Promise<boolean> {
    const token = process.env.META_ACCESS_TOKEN;
    const phoneId = process.env.META_PHONE_NUMBER_ID;
    const template = process.env.META_WHATSAPP_TEMPLATE || 'booking_confirmation';

    if (!token || !phoneId) return false;

    try {
      const formatted = this.formatPhone(phone);
      const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formatted,
          type: 'template',
          template: {
            name: template,
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: booking.customer.name },
                  { type: 'text', text: booking.bookingRef },
                  { type: 'text', text: booking.court?.name || '-' },
                  { type: 'text', text: dayjs(booking.date).format('D MMM YYYY') },
                  { type: 'text', text: `${booking.startTime} – ${booking.endTime}` },
                  { type: 'text', text: `LKR ${Number(booking.totalAmount).toLocaleString()}` },
                ],
              },
            ],
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        this.logger.warn(`WhatsApp failed for ${formatted}: ${JSON.stringify(err)}`);
        return false;
      }

      this.logger.log(`WhatsApp sent to ${formatted} for booking ${booking.bookingRef}`);
      return true;
    } catch (err) {
      this.logger.warn(`WhatsApp error: ${err}`);
      return false;
    }
  }

  private async sendSMS(phone: string, message: string): Promise<void> {
    const userId = process.env.NOTIFY_USER_ID;
    const apiKey = process.env.NOTIFY_API_KEY;
    const senderId = process.env.NOTIFY_SENDER_ID || 'FutsalBK';

    if (!userId || !apiKey) {
      this.logger.warn('SMS not configured (NOTIFY_USER_ID / NOTIFY_API_KEY missing)');
      return;
    }

    try {
      const formatted = this.formatPhone(phone);
      const params = new URLSearchParams({ user_id: userId, api_key: apiKey, sender_id: senderId, to: formatted, message });
      const res = await fetch(`https://app.notify.lk/api/v1/send?${params}`);
      const data = await res.json().catch(() => ({}));

      if ((data as any).status === 'success') {
        this.logger.log(`SMS sent to ${formatted}`);
      } else {
        this.logger.warn(`SMS failed: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      this.logger.warn(`SMS error: ${err}`);
    }
  }

  private buildSmsMessage(booking: any): string {
    return (
      `Booking Confirmed!\n` +
      `Ref: ${booking.bookingRef}\n` +
      `Court: ${booking.court?.name}\n` +
      `Date: ${dayjs(booking.date).format('D MMM YYYY')}\n` +
      `Time: ${booking.startTime} – ${booking.endTime}\n` +
      `Amount: LKR ${Number(booking.totalAmount).toLocaleString()}`
    );
  }

  private formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('94')) return `+${cleaned}`;
    if (cleaned.startsWith('0')) return `+94${cleaned.slice(1)}`;
    return `+94${cleaned}`;
  }
}
