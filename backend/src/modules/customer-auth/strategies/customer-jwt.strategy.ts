import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(Strategy, 'customer-jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.CUSTOMER_JWT_SECRET || process.env.JWT_SECRET || 'customer_secret',
    });
  }

  async validate(payload: any) {
    return { sub: payload.sub, email: payload.email, type: 'customer' };
  }
}
