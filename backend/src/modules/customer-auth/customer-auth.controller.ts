import { Controller, Post, Get, Body, Patch, UseGuards, Request, Res, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { CustomerAuthService } from './customer-auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CustomerJwtGuard } from './guards/customer-jwt.guard';

@ApiTags('Customer Auth')
@Controller('customer-auth')
export class CustomerAuthController {
  constructor(private service: CustomerAuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.service.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.service.login(dto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Request() req, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    try {
      const result = await this.service.googleLogin(req.user);
      res.redirect(`${frontendUrl}/auth/callback?token=${result.access_token}&name=${encodeURIComponent(result.customer.name)}`);
    } catch (err) {
      res.redirect(`${frontendUrl}/login?error=google_signin_failed`);
    }
  }

  @UseGuards(CustomerJwtGuard)
  @ApiBearerAuth()
  @Get('me')
  getProfile(@Request() req) {
    return this.service.getProfile(req.user.sub);
  }

  @UseGuards(CustomerJwtGuard)
  @ApiBearerAuth()
  @Patch('profile')
  updateProfile(@Request() req, @Body() body: { name?: string; phone?: string }) {
    return this.service.updateProfile(req.user.sub, body);
  }
}
