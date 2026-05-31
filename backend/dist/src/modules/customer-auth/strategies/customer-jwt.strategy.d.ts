import { Strategy } from 'passport-jwt';
declare const CustomerJwtStrategy_base: new (...args: any[]) => Strategy;
export declare class CustomerJwtStrategy extends CustomerJwtStrategy_base {
    constructor();
    validate(payload: any): Promise<{
        sub: any;
        email: any;
        type: string;
    }>;
}
export {};
