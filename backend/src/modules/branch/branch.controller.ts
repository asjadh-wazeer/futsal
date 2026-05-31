import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BranchService } from './branch.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Branches')
@Controller('branches')
export class BranchController {
  constructor(private service: BranchService) {}

  @Get()
  findAll(@Query('businessId') businessId?: string) {
    return this.service.findAll(businessId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/sports')
  getSports(@Param('id') id: string) {
    return this.service.findSportsByBranch(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  create(@Request() req, @Body() body: any) {
    return this.service.create(req.user.businessId, body);
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
