import { PrismaService } from '../../prisma/prisma.service';
export declare class PaymentService {
    private prisma;
    constructor(prisma: PrismaService);
    initiatePayHere(bookingId: string): Promise<{
        merchantId: string;
        orderId: string;
        amount: string;
        currency: string;
        hash: string;
        mode: string;
        notifyUrl: string;
        returnUrl: string;
        cancelUrl: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        itemName: string;
    }>;
    handleNotify(body: any): Promise<{
        status: string;
    }>;
    confirmCash(bookingId: string): Promise<{
        customer: {
            id: string;
            name: string;
            phone: string | null;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
            password: string | null;
            googleId: string | null;
            avatarUrl: string | null;
            isVerified: boolean;
            totalSpent: import("@prisma/client/runtime/library").Decimal;
            visitCount: number;
        };
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            method: import(".prisma/client").$Enums.PaymentMethod;
            transactionId: string | null;
            gatewayRef: string | null;
            paidAt: Date | null;
            bookingId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        bookingRef: string;
        courtId: string;
        customerId: string;
        date: Date;
        startTime: string;
        endTime: string;
        duration: number;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.BookingStatus;
        notes: string | null;
    }>;
}
