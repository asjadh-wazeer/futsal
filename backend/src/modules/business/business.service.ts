import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BusinessService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.business.findUnique({
      where: { id },
      include: { branches: { where: { isActive: true }, select: { id: true, name: true, city: true } } },
    });
  }

  async getPublicSettings(slug: string) {
    return this.prisma.business.findUnique({
      where: { slug },
      select: {
        id: true, name: true, slug: true, logo: true, description: true,
        primaryColor: true, accentColor: true, phone: true, email: true,
        currency: true,
        branches: { where: { isActive: true }, select: { id: true, name: true, city: true, address: true, phone: true, openTime: true, closeTime: true } },
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.business.update({ where: { id }, data });
  }
}
