import { PrismaService } from '../../prisma/prisma.service';
export declare class CustomerService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(search?: string): Promise<({
        _count: {
            bookings: number;
        };
    } & {
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
    })[]>;
    findOne(id: string): Promise<{
        bookings: ({
            branch: {
                id: string;
                name: string;
                phone: string | null;
                email: string | null;
                address: string;
                city: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                businessId: string;
                mapUrl: string | null;
                openTime: string;
                closeTime: string;
                slotDuration: number;
            };
            court: {
                sports: {
                    id: string;
                    name: string;
                    description: string | null;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    icon: string | null;
                    color: string;
                }[];
            } & {
                id: string;
                name: string;
                description: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                branchId: string;
                image: string | null;
                pricePerHour: import("@prisma/client/runtime/library").Decimal;
                size: string | null;
                minDuration: number;
                maxDuration: number;
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
            sportId: string | null;
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
        })[];
    } & {
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
    }>;
    findOrCreate(phone: string, name: string, email?: string): Promise<{
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
    }>;
    updateSpending(customerId: string, amount: number): Promise<{
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
    }>;
}
