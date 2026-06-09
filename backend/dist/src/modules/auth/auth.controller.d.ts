import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        access_token: string;
        admin: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.AdminRole;
            branchId: string;
            business: {
                id: string;
                name: string;
                logo: string;
                primaryColor: string;
            };
        };
    }>;
    getProfile(req: any): Promise<{
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
        branchId: string;
        role: import(".prisma/client").$Enums.AdminRole;
    }>;
    changePassword(req: any, body: {
        oldPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
}
