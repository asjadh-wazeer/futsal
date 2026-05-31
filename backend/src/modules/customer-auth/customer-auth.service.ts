import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class CustomerAuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  private sign(customer: any) {
    return this.jwt.sign({
      sub: customer.id,
      email: customer.email,
      type: 'customer',
    });
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.customer.findFirst({
      where: {
        OR: [
          dto.email ? { email: dto.email } : {},
          dto.phone ? { phone: dto.phone } : {},
        ].filter((x) => Object.keys(x).length > 0),
      },
    });

    if (existing) {
      throw new ConflictException(
        existing.email === dto.email
          ? 'An account with this email already exists'
          : 'An account with this phone number already exists',
      );
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const customer = await this.prisma.customer.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        password: hashed,
        isVerified: false,
      },
    });

    return { access_token: this.sign(customer), customer: this.sanitize(customer) };
  }

  async login(dto: LoginDto) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        OR: [
          dto.identifier.includes('@') ? { email: dto.identifier } : {},
          !dto.identifier.includes('@') ? { phone: dto.identifier } : {},
        ].filter((x) => Object.keys(x).length > 0),
      },
    });

    if (!customer || !customer.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, customer.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return { access_token: this.sign(customer), customer: this.sanitize(customer) };
  }

  async googleLogin(googleUser: any) {
    let customer = await this.prisma.customer.findFirst({
      where: {
        OR: [
          { googleId: googleUser.googleId },
          googleUser.email ? { email: googleUser.email } : {},
        ].filter((x) => Object.keys(x).length > 0),
      },
    });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          name: googleUser.name,
          email: googleUser.email,
          googleId: googleUser.googleId,
          avatarUrl: googleUser.picture,
          isVerified: true,
        },
      });
    } else if (!customer.googleId) {
      customer = await this.prisma.customer.update({
        where: { id: customer.id },
        data: { googleId: googleUser.googleId, avatarUrl: googleUser.picture, isVerified: true },
      });
    }

    return { access_token: this.sign(customer), customer: this.sanitize(customer) };
  }

  async getProfile(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        bookings: {
          include: {
            court: { include: { sport: true } },
            branch: { select: { name: true, city: true } },
            payment: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return { ...this.sanitize(customer), bookings: customer.bookings };
  }

  async updateProfile(customerId: string, data: { name?: string; phone?: string }) {
    const customer = await this.prisma.customer.update({
      where: { id: customerId },
      data,
    });
    return this.sanitize(customer);
  }

  private sanitize(c: any) {
    const { password, ...rest } = c;
    return rest;
  }
}
