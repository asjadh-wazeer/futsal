import { CourtService } from './court.service';
export declare class CourtController {
    private service;
    constructor(service: CourtService);
    findAll(branchId?: string, sportId?: string): Promise<({
        branch: {
            name: string;
            city: string;
        };
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
    }>;
    getAvailability(id: string, date: string): Promise<{
        courtId: string;
        date: string;
        slots: {
            time: string;
            available: boolean;
            endTime: string;
        }[];
    }>;
    create(body: any): Promise<{
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
    }>;
    update(id: string, body: any): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}
