import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CourtService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId?: string, sportId?: string) {
    return this.prisma.court.findMany({
      where: {
        isActive: true,
        ...(branchId && { branchId }),
        ...(sportId && { sports: { some: { id: sportId } } }),
      },
      include: { sports: true, branch: { select: { name: true, city: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const court = await this.prisma.court.findUnique({
      where: { id },
      include: { sports: true, branch: true },
    });
    if (!court) throw new NotFoundException('Court not found');
    return court;
  }

  async getAvailability(courtId: string, date: string) {
    const court = await this.findOne(courtId);
    const branch = court.branch as any;

    const openHour = parseInt(branch.openTime.split(':')[0]);
    const closeHour = parseInt(branch.closeTime.split(':')[0]);

    const [bookings, rules] = await Promise.all([
      this.prisma.booking.findMany({
        where: { courtId, date: new Date(date), status: { notIn: ['CANCELLED'] } },
        select: { startTime: true, endTime: true },
      }),
      this.prisma.pricingRule.findMany({
        where: { courtId, isActive: true },
        orderBy: { priority: 'desc' },
      }),
    ]);

    const d = new Date(date);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const basePrice = Number(court.pricePerHour);

    const bookedRanges = bookings.map((b) => ({ start: b.startTime, end: b.endTime }));
    const slots: { time: string; endTime: string; available: boolean; price: number }[] = [];

    for (let h = openHour; h < closeHour; h++) {
      const startTime = `${String(h).padStart(2, '0')}:00`;
      const endTime = `${String(h + 1).padStart(2, '0')}:00`;

      const isBooked = bookedRanges.some((range) => {
        const slotStart = h * 60;
        const slotEnd = (h + 1) * 60;
        const bookStart = parseInt(range.start.split(':')[0]) * 60 + parseInt(range.start.split(':')[1]);
        const bookEnd = parseInt(range.end.split(':')[0]) * 60 + parseInt(range.end.split(':')[1]);
        return slotStart < bookEnd && slotEnd > bookStart;
      });

      const match = rules.find((r) => {
        const dayOk = r.dayType === 'ALL' || (r.dayType === 'WEEKDAY' && !isWeekend) || (r.dayType === 'WEEKEND' && isWeekend);
        return dayOk && h >= r.startHour && h < r.endHour;
      });
      const price = match ? Number(match.pricePerHour) : basePrice;

      slots.push({ time: startTime, endTime, available: !isBooked, price });
    }

    return { courtId, date, slots };
  }

  async create(data: any) {
    const { sportIds, ...rest } = data;
    return this.prisma.court.create({
      data: {
        ...rest,
        ...(sportIds?.length && { sports: { connect: sportIds.map((id: string) => ({ id })) } }),
      },
      include: { sports: true },
    });
  }

  async update(id: string, data: any) {
    const { sportIds, ...rest } = data;
    return this.prisma.court.update({
      where: { id },
      data: {
        ...rest,
        ...(sportIds && { sports: { set: sportIds.map((id: string) => ({ id })) } }),
      },
      include: { sports: true },
    });
  }

  async remove(id: string) {
    return this.prisma.court.update({ where: { id }, data: { isActive: false } });
  }
}
