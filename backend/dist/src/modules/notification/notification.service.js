"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const dayjs = require("dayjs");
const nodemailer = require("nodemailer");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor() {
        this.logger = new common_1.Logger(NotificationService_1.name);
        this.transporter = null;
    }
    getTransporter() {
        if (this.transporter)
            return this.transporter;
        const host = process.env.SMTP_HOST;
        const port = process.env.SMTP_PORT;
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        if (!host || !user || !pass)
            return null;
        this.transporter = nodemailer.createTransport({
            host,
            port: port ? parseInt(port, 10) : 587,
            secure: port === '465',
            auth: { user, pass },
        });
        return this.transporter;
    }
    async sendBookingConfirmation(booking) {
        const phone = booking.customer?.phone;
        const email = booking.customer?.email;
        if (phone) {
            const whatsappSent = await this.sendWhatsApp(phone, booking);
            if (!whatsappSent) {
                await this.sendSMS(phone, this.buildSmsMessage(booking));
            }
        }
        if (email) {
            await this.sendEmail(email, booking);
        }
    }
    async sendEmail(email, booking) {
        const transporter = this.getTransporter();
        if (!transporter) {
            this.logger.warn('Email not configured (SMTP_HOST / SMTP_USER / SMTP_PASS missing)');
            return;
        }
        const from = process.env.SMTP_FROM || 'Lanka Futsal Hub <no-reply@lankafutsal.lk>';
        try {
            await transporter.sendMail({
                from,
                to: email,
                subject: `Booking Confirmed — ${booking.bookingRef}`,
                html: this.buildEmailHtml(booking),
                text: this.buildSmsMessage(booking),
            });
            this.logger.log(`Confirmation email sent to ${email} for booking ${booking.bookingRef}`);
        }
        catch (err) {
            this.logger.warn(`Email error: ${err}`);
        }
    }
    buildEmailHtml(booking) {
        return `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #059669;">Booking Confirmed!</h2>
        <p>Hi ${booking.customer?.name || 'there'}, your booking is confirmed.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr><td style="padding: 6px 0; color: #6b7280;">Reference</td><td style="padding: 6px 0; font-weight: bold;">${booking.bookingRef}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Court</td><td style="padding: 6px 0;">${booking.court?.name || '-'}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Date</td><td style="padding: 6px 0;">${dayjs(booking.date).format('D MMM YYYY')}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Time</td><td style="padding: 6px 0;">${booking.startTime} – ${booking.endTime}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Amount</td><td style="padding: 6px 0;">LKR ${Number(booking.totalAmount).toLocaleString()}</td></tr>
        </table>
        <p style="margin-top: 16px; color: #6b7280; font-size: 13px;">Please keep your reference number handy when you arrive at the venue.</p>
      </div>
    `;
    }
    async sendWhatsApp(phone, booking) {
        const token = process.env.META_ACCESS_TOKEN;
        const phoneId = process.env.META_PHONE_NUMBER_ID;
        const template = process.env.META_WHATSAPP_TEMPLATE || 'booking_confirmation';
        if (!token || !phoneId)
            return false;
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
        }
        catch (err) {
            this.logger.warn(`WhatsApp error: ${err}`);
            return false;
        }
    }
    async sendSMS(phone, message) {
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
            if (data.status === 'success') {
                this.logger.log(`SMS sent to ${formatted}`);
            }
            else {
                this.logger.warn(`SMS failed: ${JSON.stringify(data)}`);
            }
        }
        catch (err) {
            this.logger.warn(`SMS error: ${err}`);
        }
    }
    buildSmsMessage(booking) {
        return (`Booking Confirmed!\n` +
            `Ref: ${booking.bookingRef}\n` +
            `Court: ${booking.court?.name}\n` +
            `Date: ${dayjs(booking.date).format('D MMM YYYY')}\n` +
            `Time: ${booking.startTime} – ${booking.endTime}\n` +
            `Amount: LKR ${Number(booking.totalAmount).toLocaleString()}`);
    }
    formatPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('94'))
            return `+${cleaned}`;
        if (cleaned.startsWith('0'))
            return `+94${cleaned.slice(1)}`;
        return `+94${cleaned}`;
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)()
], NotificationService);
//# sourceMappingURL=notification.service.js.map