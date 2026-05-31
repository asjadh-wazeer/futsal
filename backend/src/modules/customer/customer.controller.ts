import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('customers')
export class CustomerController {
  constructor(private service: CustomerService) {}

  @Get()
  findAll(@Query('search') search?: string) {
    return this.service.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
