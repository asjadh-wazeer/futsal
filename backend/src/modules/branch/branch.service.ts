import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BranchService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId?: string) {
    return this.prisma.branch.findMany({
      where: { isActive: true, ...(businessId && { businessId }) },
      include: {
        _count: { select: { courts: true, bookings: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        courts: {
          where: { isActive: true },
          include: { sport: true },
        },
      },
    });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async findSportsByBranch(branchId: string) {
    const courts = await this.prisma.court.findMany({
      where: { branchId, isActive: true },
      select: { sport: true },
      distinct: ['sportId'],
    });
    return courts.map((c) => c.sport);
  }

  async create(businessId: string, data: any) {
    return this.prisma.branch.create({ data: { ...data, businessId } });
  }

  async update(id: string, data: any) {
    return this.prisma.branch.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.branch.update({ where: { id }, data: { isActive: false } });
  }
}
