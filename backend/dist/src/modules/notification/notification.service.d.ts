export declare class NotificationService {
    private readonly logger;
    private transporter;
    private getTransporter;
    sendBookingConfirmation(booking: any): Promise<void>;
    private sendEmail;
    private buildEmailHtml;
    private sendWhatsApp;
    private sendSMS;
    private buildSmsMessage;
    private formatPhone;
}
