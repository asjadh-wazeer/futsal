import { Module } from '@nestjs/common';
import { OwnerRegistrationController } from './owner-registration.controller';
import { OwnerRegistrationService } from './owner-registration.service';

@Module({
  controllers: [OwnerRegistrationController],
  providers: [OwnerRegistrationService],
})
export class OwnerRegistrationModule {}
