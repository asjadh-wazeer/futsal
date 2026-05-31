import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentMethod } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomerService } from '../customer/customer.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
    private customerService: CustomerService,
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
    const totalAmount = (Number(court.pricePerHour) * duration) / 60;

    const booking = await this.prisma.booking.create({
      data: {
        bookingRef: this.generateRef(),
        branchId: court.branchId,
        courtId: dto.courtId,
        customerId: customer.id,
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        duration,
        totalAmount,
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
        court: { include: { sport: true } },
        branch: true,
        customer: true,
        payment: true,
      },
    });

    return booking;
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
          court: { include: { sport: true } },
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
        court: { include: { sport: true } },
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
        court: { include: { sport: true } },
        branch: true,
        customer: true,
        payment: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async updateStatus(id: string, status: string) {
    const booking = await this.prisma.booking.update({
      where: { id },
      data: { status: status as any },
      include: { customer: true, court: true, payment: true },
    });

    if (status === 'CONFIRMED' && booking.payment) {
      await this.prisma.payment.update({
        where: { bookingId: id },
        data: { status: 'PAID', paidAt: new Date() },
      });
      await this.customerService.updateSpending(booking.customerId, Number(booking.totalAmount));
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
        court: { include: { sport: true } },
        customer: true,
        payment: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }
}
