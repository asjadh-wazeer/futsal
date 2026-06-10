import { Strategy } from 'passport-jwt';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: any): Promise<{
        sub: any;
        name: any;
        email: any;
        role: any;
        businessId: any;
        branchId: any;
    }>;
}
export {};
