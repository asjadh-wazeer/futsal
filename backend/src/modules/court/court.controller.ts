import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CourtService } from './court.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Courts')
@Controller('courts')
export class CourtController {
  constructor(private service: CourtService) {}

  @Get()
  findAll(
    @Query('branchId') branchId?: string,
    @Query('sportId') sportId?: string,
  ) {
    return this.service.findAll(branchId, sportId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/availability')
  getAvailability(@Param('id') id: string, @Query('date') date: string) {
    return this.service.getAvailability(id, date);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
