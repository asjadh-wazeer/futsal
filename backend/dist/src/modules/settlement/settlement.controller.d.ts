import { SettlementService } from './settlement.service';
export declare class SettlementController {
    private service;
    constructor(service: SettlementService);
    private isAdmin;
    findAll(req: any, status?: string, month?: string): Promise<({
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
    })[]> | Promise<{
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
    getOutstanding(req: any): Promise<{
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
    generate(month: string, req: any): Promise<({
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
    markPaid(id: string, body: {
        notes?: string;
    }, req: any): Promise<{
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
}
