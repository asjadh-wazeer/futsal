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
            sportId: string | null;
            bookingRef: string;
            courtId: string;
            customerId: string;
            date: Date;
            startTime: string;
            endTime: string;
            duration: number;
            courtAmount: import("@prisma/client/runtime/library").Decimal;
            platformFee: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.BookingStatus;
            notes: string | null;
        })[];
        courtStats: ({
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
            _count: {
                bookings: number;
            };
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
        })[];
        todaySchedule: ({
            branch: {
                name: string;
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
            courtAmount: import("@prisma/client/runtime/library").Decimal;
            platformFee: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.BookingStatus;
            notes: string | null;
        })[];
        branches: {
            id: string;
            name: string;
            city: string;
            isActive: boolean;
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
            name: string;
            description: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            icon: string | null;
            color: string;
        }[];
        pricingRules: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            pricePerHour: import("@prisma/client/runtime/library").Decimal;
            courtId: string;
            dayType: import(".prisma/client").$Enums.DayType;
            startHour: number;
            endHour: number;
            priority: number;
        }[];
        schedules: {
            id: string;
            openTime: string;
            closeTime: string;
            courtId: string;
            dayOfWeek: number;
            isOpen: boolean;
        }[];
        _count: {
            bookings: number;
        };
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
    })[]>;
    createCourt(req: any, body: any): Promise<{
        branch: {
            id: string;
            name: string;
        };
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
    }>;
    getCourt(req: any, id: string): Promise<{
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
        pricingRules: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            pricePerHour: import("@prisma/client/runtime/library").Decimal;
            courtId: string;
            dayType: import(".prisma/client").$Enums.DayType;
            startHour: number;
            endHour: number;
            priority: number;
        }[];
        schedules: {
            id: string;
            openTime: string;
            closeTime: string;
            courtId: string;
            dayOfWeek: number;
            isOpen: boolean;
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
    }>;
    updateCourt(req: any, id: string, body: any): Promise<{
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
    }>;
    getPricingRules(req: any, id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        pricePerHour: import("@prisma/client/runtime/library").Decimal;
        courtId: string;
        dayType: import(".prisma/client").$Enums.DayType;
        startHour: number;
        endHour: number;
        priority: number;
    }[]>;
    createPricingRule(req: any, id: string, body: any): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        pricePerHour: import("@prisma/client/runtime/library").Decimal;
        courtId: string;
        dayType: import(".prisma/client").$Enums.DayType;
        startHour: number;
        endHour: number;
        priority: number;
    }>;
    updatePricingRule(req: any, ruleId: string, body: any): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        pricePerHour: import("@prisma/client/runtime/library").Decimal;
        courtId: string;
        dayType: import(".prisma/client").$Enums.DayType;
        startHour: number;
        endHour: number;
        priority: number;
    }>;
    deletePricingRule(req: any, ruleId: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        pricePerHour: import("@prisma/client/runtime/library").Decimal;
        courtId: string;
        dayType: import(".prisma/client").$Enums.DayType;
        startHour: number;
        endHour: number;
        priority: number;
    }>;
    getSchedule(req: any, id: string): Promise<{
        id: string;
        openTime: string;
        closeTime: string;
        courtId: string;
        dayOfWeek: number;
        isOpen: boolean;
    }[]>;
    upsertSchedule(req: any, id: string, body: {
        schedules: any[];
    }): Promise<{
        id: string;
        openTime: string;
        closeTime: string;
        courtId: string;
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
            sportId: string | null;
            bookingRef: string;
            courtId: string;
            customerId: string;
            date: Date;
            startTime: string;
            endTime: string;
            duration: number;
            courtAmount: import("@prisma/client/runtime/library").Decimal;
            platformFee: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.BookingStatus;
            notes: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    updateBookingStatus(req: any, id: string, body: {
        status: string;
    }): Promise<{
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
        courtAmount: import("@prisma/client/runtime/library").Decimal;
        platformFee: import("@prisma/client/runtime/library").Decimal;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.BookingStatus;
        notes: string | null;
    }>;
    getBranches(req: any): Promise<({
        _count: {
            courts: number;
            bookings: number;
            staff: number;
        };
    } & {
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
    })[]>;
    createBranch(req: any, body: any): Promise<{
        _count: {
            courts: number;
            bookings: number;
            staff: number;
        };
    } & {
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
    }>;
    updateBranch(req: any, id: string, body: any): Promise<{
        _count: {
            courts: number;
            bookings: number;
            staff: number;
        };
    } & {
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
    }>;
    getSports(): Promise<{
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        color: string;
    }[]>;
    getStaff(req: any, branchId?: string): Promise<{
        id: string;
        name: string;
        email: string;
        isActive: boolean;
        createdAt: Date;
        branch: {
            id: string;
            name: string;
            city: string;
        };
        branchId: string;
        role: import(".prisma/client").$Enums.AdminRole;
    }[]>;
    createStaff(req: any, body: any): Promise<{
        id: string;
        name: string;
        email: string;
        isActive: boolean;
        createdAt: Date;
        branch: {
            id: string;
            name: string;
            city: string;
        };
        branchId: string;
        role: import(".prisma/client").$Enums.AdminRole;
    }>;
    updateStaff(req: any, id: string, body: any): Promise<{
        id: string;
        name: string;
        email: string;
        isActive: boolean;
        createdAt: Date;
        branch: {
            id: string;
            name: string;
            city: string;
        };
        branchId: string;
        role: import(".prisma/client").$Enums.AdminRole;
    }>;
    resetStaffPassword(req: any, id: string, body: {
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    createOwner(body: any): Promise<{
        id: string;
        name: string;
        email: string;
        isActive: boolean;
        createdAt: Date;
        business: {
            id: string;
            name: string;
        };
        role: import(".prisma/client").$Enums.AdminRole;
    }>;
    getOwners(): Promise<{
        id: string;
        name: string;
        email: string;
        isActive: boolean;
        createdAt: Date;
        business: {
            id: string;
            name: string;
        };
        role: import(".prisma/client").$Enums.AdminRole;
    }[]>;
    toggleOwnerStatus(id: string): Promise<{
        id: string;
        name: string;
        email: string;
        isActive: boolean;
    }>;
    getBusinesses(): Promise<{
        id: string;
        name: string;
    }[]>;
}
