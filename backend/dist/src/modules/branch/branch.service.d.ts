import { PrismaService } from '../../prisma/prisma.service';
export declare class BranchService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(businessId?: string, search?: string, sportId?: string): Promise<({
        courts: ({
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
        })[];
        _count: {
            courts: number;
            bookings: number;
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
    findOne(id: string): Promise<{
        courts: ({
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
        })[];
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
    findSportsByBranch(branchId: string): Promise<any[]>;
    create(businessId: string, data: any): Promise<{
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
    update(id: string, data: any): Promise<{
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
    remove(id: string): Promise<{
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
}
