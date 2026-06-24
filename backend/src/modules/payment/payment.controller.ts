import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private service: PaymentService) {}

  @Get('initiate/:bookingId')
  initiatePayment(@Param('bookingId') bookingId: string) {
    return this.service.initiatePayHere(bookingId);
  }

  @Post('notify')
  handleNotify(@Body() body: any) {
    return this.service.handleNotify(body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('confirm-cash/:bookingId')
  confirmCash(@Param('bookingId') bookingId: string) {
    return this.service.confirmCash(bookingId);
  }
}
