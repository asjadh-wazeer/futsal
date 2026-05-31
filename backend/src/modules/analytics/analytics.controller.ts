import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private service: AnalyticsService) {}

  @Get('dashboard')
  getDashboard(@Request() req) {
    return this.service.getDashboard(req.user.businessId);
  }

  @Get('revenue')
  getRevenue(@Request() req, @Query('period') period: 'week' | 'month' | 'year') {
    return this.service.getRevenueChart(req.user.businessId, period || 'month');
  }

  @Get('bookings')
  getBookingStats(@Request() req) {
    return this.service.getBookingStats(req.user.businessId);
  }

  @Get('top-customers')
  getTopCustomers(@Request() req) {
    return this.service.getTopCustomers(req.user.businessId);
  }
}
