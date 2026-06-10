export declare class NotificationService {
    private readonly logger;
    sendBookingConfirmation(booking: any): Promise<void>;
    private sendWhatsApp;
    private sendSMS;
    private buildSmsMessage;
    private formatPhone;
}
