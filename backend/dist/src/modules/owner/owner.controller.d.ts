import { OwnerService } from './owner.service';
export declare class OwnerController {
    private service;
    constructor(service: OwnerService);
    getDashboard(req: any, branchId?: string): Promise<{
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
    getAnalytics(req: any, period: string, from: string, to: string, branchId?: string): Promise<{
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
    getCourts(req: any): Promise<({
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
    createCourt(req: any, body: any): Promise<{
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
    getCourt(req: any, id: string): Promise<{
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
    updateCourt(req: any, id: string, body: any): Promise<{
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
    getPricingRules(req: any, id: string): Promise<{
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
    createPricingRule(req: any, id: string, body: any): Promise<{
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
    updatePricingRule(req: any, ruleId: string, body: any): Promise<{
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
    deletePricingRule(req: any, ruleId: string): Promise<{
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
    getSchedule(req: any, id: string): Promise<{
        id: string;
        courtId: string;
        openTime: string;
        closeTime: string;
        dayOfWeek: number;
        isOpen: boolean;
    }[]>;
    upsertSchedule(req: any, id: string, body: {
        schedules: any[];
    }): Promise<{
        id: string;
        courtId: string;
        openTime: string;
        closeTime: string;
        dayOfWeek: number;
        isOpen: boolean;
    }[]>;
    getBookings(req: any, status: string, date: string, search: string, courtId: string, branchId: string, page: string, limit: string): Promise<{
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
    getCourtAvailability(req: any, id: string, date: string): Promise<{
        courtId: string;
        date: string;
        slots: {
            time: string;
            endTime: string;
            available: boolean;
            bookingSource: string | null;
        }[];
    }>;
    createManualBooking(req: any, body: any): Promise<{
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
    updateBookingStatus(req: any, id: string, body: {
        status: string;
    }): Promise<{
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
    getBranches(req: any): Promise<({
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
    createBranch(req: any, body: any): Promise<{
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
    updateBranch(req: any, id: string, body: any): Promise<{
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
    getStaff(req: any, branchId?: string): Promise<{
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
    createStaff(req: any, body: any): Promise<{
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
    updateStaff(req: any, id: string, body: any): Promise<{
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
    resetStaffPassword(req: any, id: string, body: {
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    createOwner(body: any): Promise<{
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
    toggleOwnerStatus(id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        email: string;
    }>;
    getBusinesses(): Promise<{
        id: string;
        name: string;
    }[]>;
}
