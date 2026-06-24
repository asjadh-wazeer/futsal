import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OwnerRegistrationService {
  constructor(private prisma: PrismaService) {}

  async create(dto: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    businessName: string;
    businessCity: string;
    businessAddress: string;
    businessPhone?: string;
    businessEmail?: string;
  }) {
    const existing = await this.prisma.ownerRegistration.findFirst({
      where: { email: dto.email, status: { in: ['PENDING', 'APPROVED'] } },
    });
    if (existing) throw new ConflictException('A registration with this email already exists');

    const existingAdmin = await this.prisma.admin.findUnique({ where: { email: dto.email } });
    if (existingAdmin) throw new ConflictException('This email is already registered as an account');

    const password = await bcrypt.hash(dto.password, 10);
    const { password: _, ...rest } = await this.prisma.ownerRegistration.create({
      data: { ...dto, password },
    });
    return rest;
  }

  async findAll() {
    return this.prisma.ownerRegistration.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, phone: true,
        businessName: true, businessCity: true, businessAddress: true,
        businessPhone: true, businessEmail: true,
        status: true, rejectionReason: true, reviewedAt: true, createdAt: true,
      },
    });
  }

  async approve(id: string) {
    const reg = await this.prisma.ownerRegistration.findUnique({ where: { id } });
    if (!reg) throw new NotFoundException('Registration not found');
    if (reg.status !== 'PENDING') throw new BadRequestException('Registration is not pending');

    const existingAdmin = await this.prisma.admin.findUnique({ where: { email: reg.email } });
    if (existingAdmin) {
      await this.prisma.ownerRegistration.update({ where: { id }, data: { status: 'APPROVED', reviewedAt: new Date() } });
      throw new BadRequestException('This email already has an account — registration marked approved');
    }

    const slug = this.generateSlug(reg.businessName);
    const business = await this.prisma.business.create({
      data: {
        name: reg.businessName,
        slug,
        phone: reg.businessPhone ?? undefined,
        email: reg.businessEmail ?? undefined,
        address: reg.businessAddress,
        city: reg.businessCity,
        country: 'Sri Lanka',
        currency: 'LKR',
      },
    });

    await this.prisma.admin.create({
      data: {
        businessId: business.id,
        name: reg.name,
        email: reg.email,
        password: reg.password,
        role: 'OWNER',
      },
    });

    return this.prisma.ownerRegistration.update({
      where: { id },
      data: { status: 'APPROVED', reviewedAt: new Date() },
      select: {
        id: true, name: true, email: true, businessName: true,
        status: true, reviewedAt: true,
      },
    });
  }

  async reject(id: string, reason?: string) {
    const reg = await this.prisma.ownerRegistration.findUnique({ where: { id } });
    if (!reg) throw new NotFoundException('Registration not found');
    if (reg.status !== 'PENDING') throw new BadRequestException('Registration is not pending');

    return this.prisma.ownerRegistration.update({
      where: { id },
      data: { status: 'REJECTED', rejectionReason: reason ?? null, reviewedAt: new Date() },
      select: {
        id: true, name: true, email: true, businessName: true,
        status: true, rejectionReason: true, reviewedAt: true,
      },
    });
  }

  private generateSlug(name: string): string {
    const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `${base}-${Date.now().toString(36)}`;
  }
}
