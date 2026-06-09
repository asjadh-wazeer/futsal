import { PrismaService } from '../../prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboard(businessId: string): Promise<{
        todayBookings: number;
        todayRevenue: number;
        monthBookings: number;
        monthRevenue: number;
        totalCustomers: number;
        activeBranches: number;
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
        courtUtilization: ({
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
    }>;
    getRevenueChart(businessId: string, period?: 'week' | 'month' | 'year'): Promise<{
        date: string;
        revenue: number;
    }[]>;
    getBookingStats(businessId: string): Promise<{
        byStatus: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.BookingGroupByOutputType, "status"[]> & {
            _count: number;
        })[];
        bySport: {
            name: string;
            count: number;
        }[];
        byBranch: {
            branchId: string;
            name: string;
            count: number;
            revenue: number;
        }[];
        peakHours: {
            hour: string;
            count: number;
        }[];
    }>;
    getTopCustomers(businessId: string): Promise<({
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
}
