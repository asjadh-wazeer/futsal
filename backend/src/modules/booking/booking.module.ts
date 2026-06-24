import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { CustomerModule } from '../customer/customer.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [CustomerModule, NotificationModule],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
