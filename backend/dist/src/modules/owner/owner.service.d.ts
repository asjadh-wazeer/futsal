import { PrismaService } from '../../prisma/prisma.service';
import { BookingService } from '../booking/booking.service';
export declare class OwnerService {
    private prisma;
    private bookingService;
    constructor(prisma: PrismaService, bookingService: BookingService);
    getDashboard(businessId: string, branchId?: string): Promise<{
        today: {
            bookings: number;
            revenue: number;
        };
        week: {
            bookings: number;
            revenue: number;
        };
        month: {
            bookings: number;
            revenue: number;
        };
        totalCustomers: number;
        recentBookings: ({
            branch: {
                name: string;
            };
            court: {
                sports: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                    isActive: boolean;
                    icon: string | null;
                    color: string;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                branchId: string;
                name: string;
                description: string | null;
                image: string | null;
                pricePerHour: import("@prisma/client/runtime/library").Decimal;
                size: string | null;
                minDuration: number;
                maxDuration: number;
                isActive: boolean;
            };
            customer: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                email: string | null;
                phone: string | null;
                googleId: string | null;
                password: string | null;
                avatarUrl: string | null;
                isVerified: boolean;
                totalSpent: import("@prisma/client/runtime/library").Decimal;
                visitCount: number;
            };
            payment: {
                id: string;
                status: import(".prisma/client").$Enums.PaymentStatus;
                createdAt: Date;
                updatedAt: Date;
                amount: import("@prisma/client/runtime/library").Decimal;
                method: import(".prisma/client").$Enums.PaymentMethod;
                transactionId: string | null;
                gatewayRef: string | null;
                paidAt: Date | null;
                bookingId: string;
            };
        } & {
            id: string;
            bookingRef: string;
            date: Date;
            startTime: string;
            endTime: string;
            duration: number;
            courtAmount: import("@prisma/client/runtime/library").Decimal;
            platformFee: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.BookingStatus;
            source: import(".prisma/client").$Enums.BookingSource;
            createdByName: string | null;
            cancelledByName: string | null;
            cancelledAt: Date | null;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            courtId: string;
            customerId: string;
            sportId: string | null;
        })[];
        courtStats: ({
            sports: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                isActive: boolean;
                icon: string | null;
                color: string;
            }[];
            _count: {
                bookings: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            name: string;
            description: string | null;
            image: string | null;
            pricePerHour: import("@prisma/client/runtime/library").Decimal;
            size: string | null;
            minDuration: number;
            maxDuration: number;
            isActive: boolean;
        })[];
        todaySchedule: ({
            branch: {
                name: string;
            };
            court: {
                sports: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                    isActive: boolean;
                    icon: string | null;
                    color: string;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                branchId: string;
                name: string;
                description: string | null;
                image: string | null;
                pricePerHour: import("@prisma/client/runtime/library").Decimal;
                size: string | null;
                minDuration: number;
                maxDuration: number;
                isActive: boolean;
            };
            customer: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                email: string | null;
                phone: string | null;
                googleId: string | null;
                password: string | null;
                avatarUrl: string | null;
                isVerified: boolean;
                totalSpent: import("@prisma/client/runtime/library").Decimal;
                visitCount: number;
            };
        } & {
            id: string;
            bookingRef: string;
            date: Date;
            startTime: string;
            endTime: string;
            duration: number;
            courtAmount: import("@prisma/client/runtime/library").Decimal;
            platformFee: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.BookingStatus;
            source: import(".prisma/client").$Enums.BookingSource;
            createdByName: string | null;
            cancelledByName: string | null;
            cancelledAt: Date | null;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            courtId: string;
            customerId: string;
            sportId: string | null;
        })[];
        branches: {
            id: string;
            name: string;
            isActive: boolean;
            city: string;
        }[];
    }>;
    getAnalytics(businessId: string, params: {
        period?: string;
        from?: string;
        to?: string;
        branchId?: string;
    }): Promise<{
        summary: {
            totalRevenue: number;
            totalBookings: number;
            avgPerBooking: number;
        };
        revenueChart: {
            date: string;
            revenue: number;
            bookings: number;
        }[];
        topCourts: {
            name: string;
            revenue: number;
            count: number;
        }[];
        byBranch: {
            name: string;
            revenue: number;
            count: number;
        }[];
        bySport: {
            name: string;
            count: number;
        }[];
        byStatus: {
            status: string;
            count: number;
        }[];
        peakHours: {
            hour: string;
            count: number;
        }[];
    }>;
    getCourts(businessId: string, branchId?: string): Promise<({
        branch: {
            id: string;
            name: string;
            city: string;
        };
        sports: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            isActive: boolean;
            icon: string | null;
            color: string;
        }[];
        pricingRules: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            courtId: string;
            name: string;
            pricePerHour: import("@prisma/client/runtime/library").Decimal;
            isActive: boolean;
            priority: number;
            dayType: import(".prisma/client").$Enums.DayType;
            startHour: number;
            endHour: number;
        }[];
        schedules: {
            id: string;
            courtId: string;
            openTime: string;
            closeTime: string;
            dayOfWeek: number;
            isOpen: boolean;
        }[];
        _count: {
            bookings: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        name: string;
        description: string | null;
        image: string | null;
        pricePerHour: import("@prisma/client/runtime/library").Decimal;
        size: string | null;
        minDuration: number;
        maxDuration: number;
        isActive: boolean;
    })[]>;
    getCourt(id: string, businessId: string): Promise<{
        branch: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            email: string | null;
            phone: string | null;
            businessId: string;
            address: string;
            city: string;
            mapUrl: string | null;
            openTime: string;
            closeTime: string;
            slotDuration: number;
        };
        sports: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            isActive: boolean;
            icon: string | null;
            color: string;
        }[];
        pricingRules: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            courtId: string;
            name: string;
            pricePerHour: import("@prisma/client/runtime/library").Decimal;
            isActive: boolean;
            priority: number;
            dayType: import(".prisma/client").$Enums.DayType;
            startHour: number;
            endHour: number;
        }[];
        schedules: {
            id: string;
            courtId: string;
            openTime: string;
            closeTime: string;
            dayOfWeek: number;
            isOpen: boolean;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        name: string;
        description: string | null;
        image: string | null;
        pricePerHour: import("@prisma/client/runtime/library").Decimal;
        size: string | null;
        minDuration: number;
        maxDuration: number;
        isActive: boolean;
    }>;
    createCourt(businessId: string, data: any): Promise<{
        branch: {
            id: string;
            name: string;
        };
        sports: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            isActive: boolean;
            icon: string | null;
            color: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        name: string;
        description: string | null;
        image: string | null;
        pricePerHour: import("@prisma/client/runtime/library").Decimal;
        size: string | null;
        minDuration: number;
        maxDuration: number;
        isActive: boolean;
    }>;
    updateCourt(id: string, businessId: string, data: any): Promise<{
        sports: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            isActive: boolean;
            icon: string | null;
            color: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        name: string;
        description: string | null;
        image: string | null;
        pricePerHour: import("@prisma/client/runtime/library").Decimal;
        size: string | null;
        minDuration: number;
        maxDuration: number;
        isActive: boolean;
    }>;
    getPricingRules(courtId: string, businessId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        courtId: string;
        name: string;
        pricePerHour: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
        priority: number;
        dayType: import(".prisma/client").$Enums.DayType;
        startHour: number;
        endHour: number;
    }[]>;
    createPricingRule(courtId: string, businessId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        courtId: string;
        name: string;
        pricePerHour: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
        priority: number;
        dayType: import(".prisma/client").$Enums.DayType;
        startHour: number;
        endHour: number;
    }>;
    updatePricingRule(ruleId: string, businessId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        courtId: string;
        name: string;
        pricePerHour: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
        priority: number;
        dayType: import(".prisma/client").$Enums.DayType;
        startHour: number;
        endHour: number;
    }>;
    deletePricingRule(ruleId: string, businessId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        courtId: string;
        name: string;
        pricePerHour: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
        priority: number;
        dayType: import(".prisma/client").$Enums.DayType;
        startHour: number;
        endHour: number;
    }>;
    getSchedule(courtId: string, businessId: string): Promise<{
        id: string;
        courtId: string;
        openTime: string;
        closeTime: string;
        dayOfWeek: number;
        isOpen: boolean;
    }[]>;
    upsertSchedule(courtId: string, businessId: string, schedules: any[]): Promise<{
        id: string;
        courtId: string;
        openTime: string;
        closeTime: string;
        dayOfWeek: number;
        isOpen: boolean;
    }[]>;
    getBookings(businessId: string, filters: {
        status?: string;
        date?: string;
        search?: string;
        courtId?: string;
        branchId?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: ({
            branch: {
                name: string;
                city: string;
            };
            court: {
                sports: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                    isActive: boolean;
                    icon: string | null;
                    color: string;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                branchId: string;
                name: string;
                description: string | null;
                image: string | null;
                pricePerHour: import("@prisma/client/runtime/library").Decimal;
                size: string | null;
                minDuration: number;
                maxDuration: number;
                isActive: boolean;
            };
            customer: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                email: string | null;
                phone: string | null;
                googleId: string | null;
                password: string | null;
                avatarUrl: string | null;
                isVerified: boolean;
                totalSpent: import("@prisma/client/runtime/library").Decimal;
                visitCount: number;
            };
            payment: {
                id: string;
                status: import(".prisma/client").$Enums.PaymentStatus;
                createdAt: Date;
                updatedAt: Date;
                amount: import("@prisma/client/runtime/library").Decimal;
                method: import(".prisma/client").$Enums.PaymentMethod;
                transactionId: string | null;
                gatewayRef: string | null;
                paidAt: Date | null;
                bookingId: string;
            };
        } & {
            id: string;
            bookingRef: string;
            date: Date;
            startTime: string;
            endTime: string;
            duration: number;
            courtAmount: import("@prisma/client/runtime/library").Decimal;
            platformFee: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.BookingStatus;
            source: import(".prisma/client").$Enums.BookingSource;
            createdByName: string | null;
            cancelledByName: string | null;
            cancelledAt: Date | null;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            courtId: string;
            customerId: string;
            sportId: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    createManualBooking(user: {
        businessId: string;
        role: string;
        branchId?: string;
        name?: string;
    }, dto: any): Promise<{
        branch: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            email: string | null;
            phone: string | null;
            businessId: string;
            address: string;
            city: string;
            mapUrl: string | null;
            openTime: string;
            closeTime: string;
            slotDuration: number;
        };
        court: {
            sports: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                isActive: boolean;
                icon: string | null;
                color: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            branchId: string;
            name: string;
            description: string | null;
            image: string | null;
            pricePerHour: import("@prisma/client/runtime/library").Decimal;
            size: string | null;
            minDuration: number;
            maxDuration: number;
            isActive: boolean;
        };
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            email: string | null;
            phone: string | null;
            googleId: string | null;
            password: string | null;
            avatarUrl: string | null;
            isVerified: boolean;
            totalSpent: import("@prisma/client/runtime/library").Decimal;
            visitCount: number;
        };
        payment: {
            id: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            method: import(".prisma/client").$Enums.PaymentMethod;
            transactionId: string | null;
            gatewayRef: string | null;
            paidAt: Date | null;
            bookingId: string;
        };
    } & {
        id: string;
        bookingRef: string;
        date: Date;
        startTime: string;
        endTime: string;
        duration: number;
        courtAmount: import("@prisma/client/runtime/library").Decimal;
        platformFee: import("@prisma/client/runtime/library").Decimal;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.BookingStatus;
        source: import(".prisma/client").$Enums.BookingSource;
        createdByName: string | null;
        cancelledByName: string | null;
        cancelledAt: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        courtId: string;
        customerId: string;
        sportId: string | null;
    }>;
    updateBookingStatus(bookingId: string, businessId: string, status: string, cancelledByName?: string): Promise<{
        id: string;
        bookingRef: string;
        date: Date;
        startTime: string;
        endTime: string;
        duration: number;
        courtAmount: import("@prisma/client/runtime/library").Decimal;
        platformFee: import("@prisma/client/runtime/library").Decimal;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.BookingStatus;
        source: import(".prisma/client").$Enums.BookingSource;
        createdByName: string | null;
        cancelledByName: string | null;
        cancelledAt: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        courtId: string;
        customerId: string;
        sportId: string | null;
    }>;
    getCourtAvailability(courtId: string, date: string, businessId: string): Promise<{
        courtId: string;
        date: string;
        slots: {
            time: string;
            endTime: string;
            available: boolean;
            bookingSource: string | null;
        }[];
    }>;
    getBranches(businessId: string): Promise<({
        _count: {
            bookings: number;
            courts: number;
            staff: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        email: string | null;
        phone: string | null;
        businessId: string;
        address: string;
        city: string;
        mapUrl: string | null;
        openTime: string;
        closeTime: string;
        slotDuration: number;
    })[]>;
    createBranch(businessId: string, data: any): Promise<{
        _count: {
            bookings: number;
            courts: number;
            staff: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        email: string | null;
        phone: string | null;
        businessId: string;
        address: string;
        city: string;
        mapUrl: string | null;
        openTime: string;
        closeTime: string;
        slotDuration: number;
    }>;
    updateBranch(id: string, businessId: string, data: any): Promise<{
        _count: {
            bookings: number;
            courts: number;
            staff: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        email: string | null;
        phone: string | null;
        businessId: string;
        address: string;
        city: string;
        mapUrl: string | null;
        openTime: string;
        closeTime: string;
        slotDuration: number;
    }>;
    getSports(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        isActive: boolean;
        icon: string | null;
        color: string;
    }[]>;
    getStaff(businessId: string, branchId?: string): Promise<{
        id: string;
        createdAt: Date;
        branch: {
            id: string;
            name: string;
            city: string;
        };
        branchId: string;
        name: string;
        isActive: boolean;
        email: string;
        role: import(".prisma/client").$Enums.AdminRole;
    }[]>;
    createStaff(businessId: string, data: {
        name: string;
        email: string;
        password: string;
        branchId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        branch: {
            id: string;
            name: string;
            city: string;
        };
        branchId: string;
        name: string;
        isActive: boolean;
        email: string;
        role: import(".prisma/client").$Enums.AdminRole;
    }>;
    updateStaff(staffId: string, businessId: string, data: {
        name?: string;
        branchId?: string;
        isActive?: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        branch: {
            id: string;
            name: string;
            city: string;
        };
        branchId: string;
        name: string;
        isActive: boolean;
        email: string;
        role: import(".prisma/client").$Enums.AdminRole;
    }>;
    resetStaffPassword(staffId: string, businessId: string, newPassword: string): Promise<{
        message: string;
    }>;
    createOwner(data: {
        name: string;
        email: string;
        password: string;
        businessId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        isActive: boolean;
        email: string;
        business: {
            id: string;
            name: string;
        };
        role: import(".prisma/client").$Enums.AdminRole;
    }>;
    getOwners(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        isActive: boolean;
        email: string;
        business: {
            id: string;
            name: string;
        };
        role: import(".prisma/client").$Enums.AdminRole;
    }[]>;
    toggleOwnerStatus(ownerId: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        email: string;
    }>;
    getBusinesses(): Promise<{
        id: string;
        name: string;
    }[]>;
    resolvePrice(courtId: string, date: string, startTime: string): Promise<number>;
}
