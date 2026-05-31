import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CustomerAuthController } from './customer-auth.controller';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerJwtStrategy } from './strategies/customer-jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.CUSTOMER_JWT_SECRET || process.env.JWT_SECRET || 'customer_secret',
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [CustomerAuthController],
  providers: [CustomerAuthService, CustomerJwtStrategy, GoogleStrategy],
  exports: [CustomerAuthService],
})
export class CustomerAuthModule {}
