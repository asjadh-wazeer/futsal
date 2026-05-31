import { BranchService } from './branch.service';
export declare class BranchController {
    private service;
    constructor(service: BranchService);
    findAll(businessId?: string): Promise<({
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
    getSports(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        color: string;
    }[]>;
    create(req: any, body: any): Promise<{
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
    update(id: string, body: any): Promise<{
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
