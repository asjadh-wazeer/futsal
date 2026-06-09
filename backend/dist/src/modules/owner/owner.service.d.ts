import { PrismaService } from '../../prisma/prisma.service';
export declare class OwnerService {
    private prisma;
    constructor(prisma: PrismaService);
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
    getCourts(businessId: string): Promise<({
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
    getCourt(id: string, businessId: string): Promise<{
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
    createCourt(businessId: string, data: any): Promise<{
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
    updateCourt(id: string, businessId: string, data: any): Promise<{
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
    getPricingRules(courtId: string, businessId: string): Promise<{
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
    createPricingRule(courtId: string, businessId: string, data: any): Promise<{
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
    updatePricingRule(ruleId: string, businessId: string, data: any): Promise<{
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
    deletePricingRule(ruleId: string, businessId: string): Promise<{
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
    getSchedule(courtId: string, businessId: string): Promise<{
        id: string;
        openTime: string;
        closeTime: string;
        courtId: string;
        dayOfWeek: number;
        isOpen: boolean;
    }[]>;
    upsertSchedule(courtId: string, businessId: string, schedules: any[]): Promise<{
        id: string;
        openTime: string;
        closeTime: string;
        courtId: string;
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
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.BookingStatus;
            notes: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    updateBookingStatus(bookingId: string, businessId: string, status: string): Promise<{
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
    }>;
    getBranches(businessId: string): Promise<({
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
    createBranch(businessId: string, data: any): Promise<{
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
    updateBranch(id: string, businessId: string, data: any): Promise<{
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
    getStaff(businessId: string, branchId?: string): Promise<{
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
    createStaff(businessId: string, data: {
        name: string;
        email: string;
        password: string;
        branchId: string;
    }): Promise<{
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
    updateStaff(staffId: string, businessId: string, data: {
        name?: string;
        branchId?: string;
        isActive?: boolean;
    }): Promise<{
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
    toggleOwnerStatus(ownerId: string): Promise<{
        id: string;
        name: string;
        email: string;
        isActive: boolean;
    }>;
    getBusinesses(): Promise<{
        id: string;
        name: string;
    }[]>;
    resolvePrice(courtId: string, date: string, startTime: string): Promise<number>;
}
