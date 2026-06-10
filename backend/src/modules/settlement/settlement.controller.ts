import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SettlementService } from './settlement.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Settlement')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settlement')
export class SettlementController {
  constructor(private service: SettlementService) {}

  private isAdmin(req: any) {
    return ['SUPER_ADMIN', 'ADMIN'].includes(req.user?.role);
  }

  @Get()
  findAll(@Request() req: any, @Query('status') status?: string, @Query('month') month?: string) {
    if (this.isAdmin(req)) {
      return this.service.findAll({ status, month });
    }
    if (req.user?.role === 'OWNER') {
      return this.service.getBusinessSettlements(req.user.businessId);
    }
    throw new ForbiddenException();
  }

  @Get('outstanding')
  getOutstanding(@Request() req: any) {
    if (!this.isAdmin(req)) throw new ForbiddenException();
    return this.service.getOutstandingSummary();
  }

  @Post('generate/:month')
  generate(@Param('month') month: string, @Request() req: any) {
    if (!this.isAdmin(req)) throw new ForbiddenException();
    return this.service.generateForMonth(month);
  }

  @Patch(':id/mark-paid')
  markPaid(@Param('id') id: string, @Body() body: { notes?: string }, @Request() req: any) {
    if (!this.isAdmin(req)) throw new ForbiddenException();
    return this.service.markPaid(id, body.notes);
  }
}
