import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettlementService {
  constructor(private prisma: PrismaService) {}

  async generateForMonth(month: string) {
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59);

    const bookings = await this.prisma.booking.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
      include: { branch: { select: { businessId: true } } },
    });

    const byBusiness: Record<string, typeof bookings> = {};
    for (const b of bookings) {
      const bid = b.branch.businessId;
      if (!byBusiness[bid]) byBusiness[bid] = [];
      byBusiness[bid].push(b);
    }

    const results = await Promise.all(
      Object.entries(byBusiness).map(async ([businessId, bBookings]) => {
        const grossRevenue = bBookings.reduce((s, b) => s + Number(b.totalAmount), 0);
        const platformFees = bBookings.reduce((s, b) => s + Number(b.platformFee), 0);
        const ownerAmount = grossRevenue - platformFees;

        return this.prisma.settlement.upsert({
          where: { businessId_month: { businessId, month } },
          create: { businessId, month, totalBookings: bBookings.length, grossRevenue, platformFees, ownerAmount, status: 'PENDING' },
          update: { totalBookings: bBookings.length, grossRevenue, platformFees, ownerAmount },
          include: { business: { select: { id: true, name: true, city: true } } },
        });
      }),
    );

    return results;
  }

  async findAll(filters: { status?: string; businessId?: string; month?: string }) {
    return this.prisma.settlement.findMany({
      where: {
        ...(filters.status && { status: filters.status as any }),
        ...(filters.businessId && { businessId: filters.businessId }),
        ...(filters.month && { month: filters.month }),
      },
      include: { business: { select: { id: true, name: true, city: true } } },
      orderBy: [{ month: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async markPaid(id: string, notes?: string) {
    const settlement = await this.prisma.settlement.findUnique({ where: { id } });
    if (!settlement) throw new NotFoundException('Settlement not found');

    return this.prisma.settlement.update({
      where: { id },
      data: { status: 'PAID', paidAt: new Date(), ...(notes && { notes }) },
      include: { business: { select: { id: true, name: true, city: true } } },
    });
  }

  async getOutstandingSummary() {
    const pending = await this.prisma.settlement.findMany({
      where: { status: 'PENDING' },
      include: { business: { select: { id: true, name: true } } },
    });
    const total = pending.reduce((s, x) => s + Number(x.ownerAmount), 0);
    const totalFees = pending.reduce((s, x) => s + Number(x.platformFees), 0);
    return { count: pending.length, totalOwnerAmount: total, totalPlatformFees: totalFees, items: pending };
  }

  async getBusinessSettlements(businessId: string) {
    const settlements = await this.prisma.settlement.findMany({
      where: { businessId },
      orderBy: { month: 'desc' },
    });
    const totalPaid = settlements.filter((s) => s.status === 'PAID').reduce((sum, s) => sum + Number(s.ownerAmount), 0);
    const totalPending = settlements.filter((s) => s.status === 'PENDING').reduce((sum, s) => sum + Number(s.ownerAmount), 0);
    return { settlements, totalPaid, totalPending };
  }
}
