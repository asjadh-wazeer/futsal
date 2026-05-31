import { PrismaService } from '../../prisma/prisma.service';
export declare class SportService {
    private prisma;
    constructor(prisma: PrismaService);
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
    create(data: any): Promise<{
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        color: string;
    }>;
    update(id: string, data: any): Promise<{
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
