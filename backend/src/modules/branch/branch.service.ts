import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BranchService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId?: string, search?: string, sportId?: string) {
    return this.prisma.branch.findMany({
      where: {
        isActive: true,
        ...(businessId && { businessId }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { city: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(sportId && {
          courts: { some: { sports: { some: { id: sportId } }, isActive: true } },
        }),
      },
      include: {
        _count: { select: { courts: true, bookings: true } },
        courts: {
          where: { isActive: true },
          include: { sports: true },
        },
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
          include: { sports: true },
        },
      },
    });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async findSportsByBranch(branchId: string) {
    const courts = await this.prisma.court.findMany({
      where: { branchId, isActive: true },
      include: { sports: true },
    });
    const seen = new Set<string>();
    const sports: any[] = [];
    for (const court of courts) {
      for (const sport of court.sports) {
        if (!seen.has(sport.id)) {
          seen.add(sport.id);
          sports.push(sport);
        }
      }
    }
    return sports;
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
