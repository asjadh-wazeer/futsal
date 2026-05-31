import { Controller, Get, Patch, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Business')
@Controller('business')
export class BusinessController {
  constructor(private service: BusinessService) {}

  @Get('public/:slug')
  getPublicSettings(@Param('slug') slug: string) {
    return this.service.getPublicSettings(slug);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  getMyBusiness(@Request() req) {
    return this.service.findOne(req.user.businessId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch()
  updateBusiness(@Request() req, @Body() body: any) {
    return this.service.update(req.user.businessId, body);
  }
}
