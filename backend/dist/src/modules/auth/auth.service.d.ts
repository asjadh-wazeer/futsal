import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    login(dto: LoginDto): Promise<{
        access_token: string;
        admin: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.AdminRole;
            business: {
                id: string;
                name: string;
                logo: string;
                primaryColor: string;
            };
        };
    }>;
    getProfile(adminId: string): Promise<{
        id: string;
        name: string;
        email: string;
        business: {
            id: string;
            name: string;
            logo: string;
            primaryColor: string;
            currency: string;
        };
        role: import(".prisma/client").$Enums.AdminRole;
    }>;
    changePassword(adminId: string, oldPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
}
