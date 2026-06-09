import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string) {
    return this.prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: { _count: { select: { bookings: true } } },
      orderBy: { totalSpent: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        bookings: {
          include: { court: { include: { sports: true } }, branch: true, payment: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
  }

  async findOrCreate(phone: string, name: string, email?: string) {
    let customer = await this.prisma.customer.findUnique({ where: { phone } });
    if (!customer) {
      customer = await this.prisma.customer.create({ data: { phone, name, email } });
    }
    return customer;
  }

  async updateSpending(customerId: string, amount: number) {
    return this.prisma.customer.update({
      where: { id: customerId },
      data: {
        totalSpent: { increment: amount },
        visitCount: { increment: 1 },
      },
    });
  }
}
