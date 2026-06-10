import { OwnerRegistrationService } from './owner-registration.service';
export declare class OwnerRegistrationController {
    private service;
    constructor(service: OwnerRegistrationService);
    register(body: any): Promise<{
        id: string;
        name: string;
        phone: string | null;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.RegistrationStatus;
        businessName: string;
        businessCity: string;
        businessAddress: string;
        businessPhone: string | null;
        businessEmail: string | null;
        rejectionReason: string | null;
        reviewedAt: Date | null;
    }>;
    findAll(req: any): Promise<{
        id: string;
        name: string;
        phone: string;
        email: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.RegistrationStatus;
        businessName: string;
        businessCity: string;
        businessAddress: string;
        businessPhone: string;
        businessEmail: string;
        rejectionReason: string;
        reviewedAt: Date;
    }[]>;
    approve(id: string, req: any): Promise<{
        id: string;
        name: string;
        email: string;
        status: import(".prisma/client").$Enums.RegistrationStatus;
        businessName: string;
        reviewedAt: Date;
    }>;
    reject(id: string, body: {
        reason?: string;
    }, req: any): Promise<{
        id: string;
        name: string;
        email: string;
        status: import(".prisma/client").$Enums.RegistrationStatus;
        businessName: string;
        rejectionReason: string;
        reviewedAt: Date;
    }>;
}
