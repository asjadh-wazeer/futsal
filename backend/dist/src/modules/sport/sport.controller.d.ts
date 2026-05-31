import { SportService } from './sport.service';
export declare class SportController {
    private service;
    constructor(service: SportService);
    findAll(): Promise<{
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        color: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        color: string;
    }>;
    create(body: any): Promise<{
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        color: string;
    }>;
    update(id: string, body: any): Promise<{
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        color: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        color: string;
    }>;
}
