import { PrismaService } from '../../prisma/prisma.service';
import { CustomerService } from '../customer/customer.service';
import { CreateBookingDto } from './dto/create-booking.dto';
export declare class BookingService {
    private prisma;
    private customerService;
    constructor(prisma: PrismaService, customerService: CustomerService);
    private generateRef;
    create(dto: CreateBookingDto): Promise<{
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
            sport: {
                id: string;
                name: string;
                description: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                icon: string | null;
                color: string;
            };
        } & {
            id: string;
            name: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            sportId: string;
            image: string | null;
            pricePerHour: import("@prisma/client/runtime/library").Decimal;
            minDuration: number;
            maxDuration: number;
        };
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
    private calcDuration;
    findAll(filters: {
        branchId?: string;
        status?: string;
        date?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: ({
            branch: {
                name: string;
                city: string;
            };
            court: {
                sport: {
                    id: string;
                    name: string;
                    description: string | null;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    icon: string | null;
                    color: string;
                };
            } & {
                id: string;
                name: string;
                description: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                branchId: string;
                sportId: string;
                image: string | null;
                pricePerHour: import("@prisma/client/runtime/library").Decimal;
                minDuration: number;
                maxDuration: number;
            };
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
        })[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    findByRef(ref: string): Promise<{
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
            sport: {
                id: string;
                name: string;
                description: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                icon: string | null;
                color: string;
            };
        } & {
            id: string;
            name: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            sportId: string;
            image: string | null;
            pricePerHour: import("@prisma/client/runtime/library").Decimal;
            minDuration: number;
            maxDuration: number;
        };
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
    findOne(id: string): Promise<{
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
            sport: {
                id: string;
                name: string;
                description: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                icon: string | null;
                color: string;
            };
        } & {
            id: string;
            name: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            sportId: string;
            image: string | null;
            pricePerHour: import("@prisma/client/runtime/library").Decimal;
            minDuration: number;
            maxDuration: number;
        };
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
    updateStatus(id: string, status: string): Promise<{
        court: {
            id: string;
            name: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            sportId: string;
            image: string | null;
            pricePerHour: import("@prisma/client/runtime/library").Decimal;
            minDuration: number;
            maxDuration: number;
        };
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
    createManual(adminId: string, dto: any): Promise<{
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
            sport: {
                id: string;
                name: string;
                description: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                icon: string | null;
                color: string;
            };
        } & {
            id: string;
            name: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            sportId: string;
            image: string | null;
            pricePerHour: import("@prisma/client/runtime/library").Decimal;
            minDuration: number;
            maxDuration: number;
        };
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
    getTodayBookings(branchId?: string): Promise<({
        court: {
            sport: {
                id: string;
                name: string;
                description: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                icon: string | null;
                color: string;
            };
        } & {
            id: string;
            name: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            sportId: string;
            image: string | null;
            pricePerHour: import("@prisma/client/runtime/library").Decimal;
            minDuration: number;
            maxDuration: number;
        };
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
    })[]>;
}
