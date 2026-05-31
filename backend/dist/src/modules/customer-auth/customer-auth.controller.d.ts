import { Response } from 'express';
import { CustomerAuthService } from './customer-auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class CustomerAuthController {
    private service;
    constructor(service: CustomerAuthService);
    register(dto: RegisterDto): Promise<{
        access_token: string;
        customer: any;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        customer: any;
    }>;
    googleLogin(): void;
    googleCallback(req: any, res: Response): Promise<void>;
    getProfile(req: any): Promise<any>;
    updateProfile(req: any, body: {
        name?: string;
        phone?: string;
    }): Promise<any>;
}
