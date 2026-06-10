import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { BusinessModule } from './modules/business/business.module';
import { BranchModule } from './modules/branch/branch.module';
import { SportModule } from './modules/sport/sport.module';
import { CourtModule } from './modules/court/court.module';
import { BookingModule } from './modules/booking/booking.module';
import { CustomerModule } from './modules/customer/customer.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PaymentModule } from './modules/payment/payment.module';
import { CustomerAuthModule } from './modules/customer-auth/customer-auth.module';
import { OwnerModule } from './modules/owner/owner.module';
import { NotificationModule } from './modules/notification/notification.module';
import { SettlementModule } from './modules/settlement/settlement.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    BusinessModule,
    BranchModule,
    SportModule,
    CourtModule,
    BookingModule,
    CustomerModule,
    AnalyticsModule,
    PaymentModule,
    CustomerAuthModule,
    OwnerModule,
    NotificationModule,
    SettlementModule,
  ],
})
export class AppModule {}
