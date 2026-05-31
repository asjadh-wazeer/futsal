import { IsString, IsDateString, IsOptional, IsEmail, IsMobilePhone } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty()
  @IsString()
  courtId: string;

  @ApiProperty({ example: '2025-12-25' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '14:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '15:00' })
  @IsString()
  endTime: string;

  @ApiProperty()
  @IsString()
  customerName: string;

  @ApiProperty()
  @IsString()
  customerPhone: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false, enum: ['ONLINE', 'CASH', 'CARD'] })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
