import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OwnerRegistrationService } from './owner-registration.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Owner Registration')
@Controller('owner-registration')
export class OwnerRegistrationController {
  constructor(private service: OwnerRegistrationService) {}

  @Post()
  register(@Body() body: any) {
    return this.service.create(body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req: any) {
    if (!['SUPER_ADMIN', 'ADMIN'].includes(req.user?.role)) throw new ForbiddenException();
    return this.service.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/approve')
  approve(@Param('id') id: string, @Request() req: any) {
    if (!['SUPER_ADMIN', 'ADMIN'].includes(req.user?.role)) throw new ForbiddenException();
    return this.service.approve(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() body: { reason?: string }, @Request() req: any) {
    if (!['SUPER_ADMIN', 'ADMIN'].includes(req.user?.role)) throw new ForbiddenException();
    return this.service.reject(id, body.reason);
  }
}
