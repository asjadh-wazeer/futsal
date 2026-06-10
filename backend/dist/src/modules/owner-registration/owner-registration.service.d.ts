import { PrismaService } from '../../prisma/prisma.service';
export declare class OwnerRegistrationService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: {
        name: string;
        email: string;
        phone?: string;
        password: string;
        businessName: string;
        businessCity: string;
        businessAddress: string;
        businessPhone?: string;
        businessEmail?: string;
    }): Promise<{
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
    findAll(): Promise<{
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
    approve(id: string): Promise<{
        id: string;
        name: string;
        email: string;
        status: import(".prisma/client").$Enums.RegistrationStatus;
        businessName: string;
        reviewedAt: Date;
    }>;
    reject(id: string, reason?: string): Promise<{
        id: string;
        name: string;
        email: string;
        status: import(".prisma/client").$Enums.RegistrationStatus;
        businessName: string;
        rejectionReason: string;
        reviewedAt: Date;
    }>;
    private generateSlug;
}
