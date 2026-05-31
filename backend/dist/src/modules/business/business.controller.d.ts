import { BusinessService } from './business.service';
export declare class BusinessController {
    private service;
    constructor(service: BusinessService);
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
    getMyBusiness(req: any): Promise<{
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
    updateBusiness(req: any, body: any): Promise<{
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
