import { PrismaService } from '../../prisma/prisma.service';
export declare class CourtService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(branchId?: string, sportId?: string): Promise<({
        branch: {
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
    getAvailability(courtId: string, date: string): Promise<{
        courtId: string;
        date: string;
        slots: {
            time: string;
            endTime: string;
            available: boolean;
            price: number;
        }[];
    }>;
    create(data: any): Promise<{
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
    update(id: string, data: any): Promise<{
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
    remove(id: string): Promise<{
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
}
