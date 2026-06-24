import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SportService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.sport.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.sport.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.sport.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.sport.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.sport.update({ where: { id }, data: { isActive: false } });
  }
}
