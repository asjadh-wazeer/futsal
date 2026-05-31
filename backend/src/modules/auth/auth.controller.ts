import { Controller, Post, Get, Body, UseGuards, Request, Patch } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('change-password')
  changePassword(
    @Request() req,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(req.user.sub, body.oldPassword, body.newPassword);
  }
}
