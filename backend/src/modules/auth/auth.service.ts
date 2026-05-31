import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { email: dto.email },
      include: { business: true },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, admin.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: admin.id, email: admin.email, role: admin.role, businessId: admin.businessId };
    const token = this.jwt.sign(payload);

    return {
      access_token: token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        business: {
          id: admin.business.id,
          name: admin.business.name,
          logo: admin.business.logo,
          primaryColor: admin.business.primaryColor,
        },
      },
    };
  }

  async getProfile(adminId: string) {
    return this.prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        business: {
          select: { id: true, name: true, logo: true, primaryColor: true, currency: true },
        },
      },
    });
  }

  async changePassword(adminId: string, oldPassword: string, newPassword: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    const valid = await bcrypt.compare(oldPassword, admin.password);
    if (!valid) throw new UnauthorizedException('Old password incorrect');
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.admin.update({ where: { id: adminId }, data: { password: hashed } });
    return { message: 'Password updated successfully' };
  }
}
