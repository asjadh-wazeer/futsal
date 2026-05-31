import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class CustomerAuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    private sign;
    register(dto: RegisterDto): Promise<{
        access_token: string;
        customer: any;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        customer: any;
    }>;
    googleLogin(googleUser: any): Promise<{
        access_token: string;
        customer: any;
    }>;
    getProfile(customerId: string): Promise<any>;
    updateProfile(customerId: string, data: {
        name?: string;
        phone?: string;
    }): Promise<any>;
    private sanitize;
}
