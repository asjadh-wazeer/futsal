import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingController {
  constructor(private service: BookingService) {}

  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.service.create(dto);
  }

  @Get('ref/:ref')
  findByRef(@Param('ref') ref: string) {
    return this.service.findByRef(ref);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  findAll(
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('date') date?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll({
      branchId,
      status,
      date,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('today')
  getToday(@Query('branchId') branchId?: string) {
    return this.service.getTodayBookings(branchId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/status')
  updateStatus(@Request() req, @Param('id') id: string, @Body('status') status: string) {
    const cancelledByName = status === 'CANCELLED' && req.user?.name
      ? `${req.user.name} (${req.user.role})`
      : undefined;
    return this.service.updateStatus(id, status, cancelledByName);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('manual')
  createManual(@Request() req, @Body() dto: any) {
    return this.service.createManual(req.user.sub, dto);
  }
}
