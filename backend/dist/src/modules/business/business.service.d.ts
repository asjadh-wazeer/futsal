import { PrismaService } from '../../prisma/prisma.service';
export declare class BusinessService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(id: string): Promise<{
        branches: {
            id: string;
            name: string;
            city: string;
        }[];
    } & {
        id: string;
        slug: string;
        name: string;
        logo: string | null;
        description: string | null;
        primaryColor: string;
        accentColor: string;
        phone: string | null;
        email: string | null;
        website: string | null;
        address: string | null;
        city: string | null;
        country: string;
        currency: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getPublicSettings(slug: string): Promise<{
        id: string;
        slug: string;
        name: string;
        logo: string;
        description: string;
        primaryColor: string;
        accentColor: string;
        phone: string;
        email: string;
        currency: string;
        branches: {
            id: string;
            name: string;
            phone: string;
            address: string;
            city: string;
            openTime: string;
            closeTime: string;
        }[];
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        slug: string;
        name: string;
        logo: string | null;
        description: string | null;
        primaryColor: string;
        accentColor: string;
        phone: string | null;
        email: string | null;
        website: string | null;
        address: string | null;
        city: string | null;
        country: string;
        currency: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
