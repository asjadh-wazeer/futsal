import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentMethod } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomerService } from '../customer/customer.service';
import { NotificationService } from '../notification/notification.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { v4 as uuidv4 } from 'uuid';

const PLATFORM_FEE_PER_HOUR = Number(process.env.PLATFORM_FEE_PER_HOUR ?? 150);

@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
    private customerService: CustomerService,
    private notificationService: NotificationService,
  ) {}

  private generateRef(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let ref = 'FBK-';
    for (let i = 0; i < 8; i++) ref += chars[Math.floor(Math.random() * chars.length)];
    return ref;
  }

  async create(dto: CreateBookingDto) {
    const court = await this.prisma.court.findUnique({
      where: { id: dto.courtId },
      include: { branch: true },
    });
    if (!court || !court.isActive) throw new NotFoundException('Court not available');

    const conflict = await this.prisma.booking.findFirst({
      where: {
        courtId: dto.courtId,
        date: new Date(dto.date),
        status: { notIn: ['CANCELLED'] },
        OR: [
          { startTime: { lt: dto.endTime }, endTime: { gt: dto.startTime } },
        ],
      },
    });
    if (conflict) throw new BadRequestException('This slot is already booked');

    const customer = await this.customerService.findOrCreate(
      dto.customerPhone,
      dto.customerName,
      dto.customerEmail,
    );

    const duration = this.calcDuration(dto.startTime, dto.endTime);
    const pricePerHour = await this.resolvePrice(dto.courtId, dto.date, dto.startTime, Number(court.pricePerHour));
    const courtAmount = (pricePerHour * duration) / 60;
    const slots = duration / 60;
    const platformFee = Math.round(PLATFORM_FEE_PER_HOUR * slots);
    const totalAmount = courtAmount + platformFee;

    const booking = await this.prisma.booking.create({
      data: {
        bookingRef: this.generateRef(),
        branchId: court.branchId,
        courtId: dto.courtId,
        customerId: customer.id,
        ...(dto.sportId && { sportId: dto.sportId }),
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        duration,
        courtAmount,
        platformFee,
        totalAmount,
        source: (dto.source as any) || 'CUSTOMER',
        createdByName: dto.createdByName ?? null,
        notes: dto.notes,
        payment: {
          create: {
            amount: totalAmount,
            method: (dto.paymentMethod as PaymentMethod) || PaymentMethod.CASH,
            status: 'PENDING',
          },
        },
      },
      include: {
        court: { include: { sports: true } },
        branch: true,
        customer: true,
        payment: true,
      },
    });

    return booking;
  }

  private async resolvePrice(courtId: string, date: string, startTime: string, defaultPrice: number): Promise<number> {
    const d = new Date(date);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const hour = parseInt(startTime.split(':')[0]);
    const rules = await this.prisma.pricingRule.findMany({
      where: { courtId, isActive: true },
      orderBy: { priority: 'desc' },
    });
    const match = rules.find((r) => {
      const dayOk = r.dayType === 'ALL' || (r.dayType === 'WEEKDAY' && !isWeekend) || (r.dayType === 'WEEKEND' && isWeekend);
      return dayOk && hour >= r.startHour && hour < r.endHour;
    });
    return match ? Number(match.pricePerHour) : defaultPrice;
  }

  private calcDuration(start: string, end: string): number {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  }

  async findAll(filters: {
    branchId?: string;
    status?: string;
    date?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { branchId, status, date, search, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (branchId) where.branchId = branchId;
    if (status) where.status = status;
    if (date) where.date = new Date(date);
    if (search) {
      where.OR = [
        { bookingRef: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search } } },
      ];
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          court: { include: { sports: true } },
          branch: { select: { name: true, city: true } },
          customer: true,
          payment: true,
        },
        orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { data: bookings, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findByRef(ref: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { bookingRef: ref },
      include: {
        court: { include: { sports: true } },
        branch: true,
        customer: true,
        payment: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        court: { include: { sports: true } },
        branch: true,
        customer: true,
        payment: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async updateStatus(id: string, status: string, cancelledByName?: string) {
    const booking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: status as any,
        ...(status === 'CANCELLED' && {
          cancelledByName: cancelledByName ?? null,
          cancelledAt: new Date(),
        }),
      },
      include: { customer: true, court: { include: { sports: true } }, payment: true },
    });

    if (status === 'CONFIRMED') {
      if (booking.payment) {
        await this.prisma.payment.update({
          where: { bookingId: id },
          data: { status: 'PAID', paidAt: new Date() },
        });
      }
      await this.customerService.updateSpending(booking.customerId, Number(booking.totalAmount));
      this.notificationService.sendBookingConfirmation(booking).catch(() => {});
    }

    return booking;
  }

  async createManual(adminId: string, dto: any) {
    return this.create(dto);
  }

  async getTodayBookings(branchId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.booking.findMany({
      where: {
        date: { gte: today, lt: tomorrow },
        ...(branchId && { branchId }),
        status: { notIn: ['CANCELLED'] },
      },
      include: {
        court: { include: { sports: true } },
        customer: true,
        payment: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }
}
