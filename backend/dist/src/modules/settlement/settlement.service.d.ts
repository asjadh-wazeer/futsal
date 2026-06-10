import { PrismaService } from '../../prisma/prisma.service';
export declare class SettlementService {
    private prisma;
    constructor(prisma: PrismaService);
    generateForMonth(month: string): Promise<({
        business: {
            id: string;
            name: string;
            city: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        status: import(".prisma/client").$Enums.SettlementStatus;
        notes: string | null;
        paidAt: Date | null;
        month: string;
        totalBookings: number;
        grossRevenue: import("@prisma/client/runtime/library").Decimal;
        platformFees: import("@prisma/client/runtime/library").Decimal;
        ownerAmount: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findAll(filters: {
        status?: string;
        businessId?: string;
        month?: string;
    }): Promise<({
        business: {
            id: string;
            name: string;
            city: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        status: import(".prisma/client").$Enums.SettlementStatus;
        notes: string | null;
        paidAt: Date | null;
        month: string;
        totalBookings: number;
        grossRevenue: import("@prisma/client/runtime/library").Decimal;
        platformFees: import("@prisma/client/runtime/library").Decimal;
        ownerAmount: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    markPaid(id: string, notes?: string): Promise<{
        business: {
            id: string;
            name: string;
            city: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        status: import(".prisma/client").$Enums.SettlementStatus;
        notes: string | null;
        paidAt: Date | null;
        month: string;
        totalBookings: number;
        grossRevenue: import("@prisma/client/runtime/library").Decimal;
        platformFees: import("@prisma/client/runtime/library").Decimal;
        ownerAmount: import("@prisma/client/runtime/library").Decimal;
    }>;
    getOutstandingSummary(): Promise<{
        count: number;
        totalOwnerAmount: number;
        totalPlatformFees: number;
        items: ({
            business: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            businessId: string;
            status: import(".prisma/client").$Enums.SettlementStatus;
            notes: string | null;
            paidAt: Date | null;
            month: string;
            totalBookings: number;
            grossRevenue: import("@prisma/client/runtime/library").Decimal;
            platformFees: import("@prisma/client/runtime/library").Decimal;
            ownerAmount: import("@prisma/client/runtime/library").Decimal;
        })[];
    }>;
    getBusinessSettlements(businessId: string): Promise<{
        settlements: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            businessId: string;
            status: import(".prisma/client").$Enums.SettlementStatus;
            notes: string | null;
            paidAt: Date | null;
            month: string;
            totalBookings: number;
            grossRevenue: import("@prisma/client/runtime/library").Decimal;
            platformFees: import("@prisma/client/runtime/library").Decimal;
            ownerAmount: import("@prisma/client/runtime/library").Decimal;
        }[];
        totalPaid: number;
        totalPending: number;
    }>;
}
