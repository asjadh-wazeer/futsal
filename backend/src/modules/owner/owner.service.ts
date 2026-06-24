import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingService } from '../booking/booking.service';

@Injectable()
export class OwnerService {
  constructor(
    private prisma: PrismaService,
    private bookingService: BookingService,
  ) {}

  // ── Dashboard ──────────────────────────────────────────────────────

  async getDashboard(businessId: string, branchId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const baseWhere = branchId
      ? { branchId }
      : { branch: { businessId } };

    const [todayStats, weekStats, monthStats, totalCustomers, recentBookings, courtStats, todayBookings, branches] =
      await Promise.all([
        this.prisma.booking.aggregate({
          where: { ...baseWhere, date: { gte: today, lt: tomorrow }, status: { notIn: ['CANCELLED'] } },
          _count: true,
          _sum: { totalAmount: true },
        }),
        this.prisma.booking.aggregate({
          where: { ...baseWhere, date: { gte: startOfWeek }, status: { notIn: ['CANCELLED'] } },
          _count: true,
          _sum: { totalAmount: true },
        }),
        this.prisma.booking.aggregate({
          where: { ...baseWhere, date: { gte: startOfMonth }, status: { notIn: ['CANCELLED'] } },
          _count: true,
          _sum: { totalAmount: true },
        }),
        this.prisma.customer.count({
          where: { bookings: { some: branchId ? { branchId } : { branch: { businessId } } } },
        }),
        this.prisma.booking.findMany({
          where: baseWhere,
          include: {
            customer: true,
            court: { include: { sports: true } },
            branch: { select: { name: true } },
            payment: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
        this.prisma.court.findMany({
          where: branchId ? { branchId, isActive: true } : { branch: { businessId }, isActive: true },
          include: { sports: true, _count: { select: { bookings: true } } },
        }),
        this.prisma.booking.findMany({
          where: { ...baseWhere, date: { gte: today, lt: tomorrow }, status: { notIn: ['CANCELLED'] } },
          include: { customer: true, court: { include: { sports: true } }, branch: { select: { name: true } } },
          orderBy: { startTime: 'asc' },
        }),
        this.prisma.branch.findMany({
          where: { businessId },
          select: { id: true, name: true, city: true, isActive: true },
          orderBy: { createdAt: 'asc' },
        }),
      ]);

    return {
      today: { bookings: todayStats._count, revenue: Number(todayStats._sum.totalAmount || 0) },
      week: { bookings: weekStats._count, revenue: Number(weekStats._sum.totalAmount || 0) },
      month: { bookings: monthStats._count, revenue: Number(monthStats._sum.totalAmount || 0) },
      totalCustomers,
      recentBookings,
      courtStats,
      todaySchedule: todayBookings,
      branches,
    };
  }

  // ── Analytics ─────────────────────────────────────────────────────

  async getAnalytics(
    businessId: string,
    params: { period?: string; from?: string; to?: string; branchId?: string },
  ) {
    const { period = 'month', from, to, branchId } = params;
    const now = new Date();

    let startDate: Date;
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    switch (period) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        if (!from || !to) throw new BadRequestException('from and to required for custom period');
        startDate = new Date(from);
        endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const baseWhere = branchId
      ? { branchId }
      : { branch: { businessId } };

    const bookings = await this.prisma.booking.findMany({
      where: {
        ...baseWhere,
        date: { gte: startDate, lte: endDate },
        status: { notIn: ['CANCELLED'] },
      },
      include: { court: true, sport: true, branch: { select: { name: true } } },
      orderBy: { date: 'asc' },
    });

    const revenueByDate: Record<string, number> = {};
    const bookingsByDate: Record<string, number> = {};
    const courtRevenue: Record<string, { name: string; revenue: number; count: number }> = {};
    const branchRevenue: Record<string, { name: string; revenue: number; count: number }> = {};
    const sportCount: Record<string, number> = {};
    const statusCount: Record<string, number> = {};
    const hourCount: Record<number, number> = {};

    bookings.forEach((b) => {
      const key = period === 'year'
        ? b.date.toISOString().substring(0, 7)
        : b.date.toISOString().substring(0, 10);

      revenueByDate[key] = (revenueByDate[key] || 0) + Number(b.totalAmount);
      bookingsByDate[key] = (bookingsByDate[key] || 0) + 1;

      if (!courtRevenue[b.courtId]) {
        courtRevenue[b.courtId] = { name: (b.court as any)?.name || b.courtId, revenue: 0, count: 0 };
      }
      courtRevenue[b.courtId].revenue += Number(b.totalAmount);
      courtRevenue[b.courtId].count += 1;

      const branchName = (b as any).branch?.name || b.branchId;
      if (!branchRevenue[b.branchId]) {
        branchRevenue[b.branchId] = { name: branchName, revenue: 0, count: 0 };
      }
      branchRevenue[b.branchId].revenue += Number(b.totalAmount);
      branchRevenue[b.branchId].count += 1;

      const sport = (b as any).sport?.name || 'General';
      sportCount[sport] = (sportCount[sport] || 0) + 1;
      statusCount[b.status] = (statusCount[b.status] || 0) + 1;

      const hour = parseInt(b.startTime.split(':')[0]);
      hourCount[hour] = (hourCount[hour] || 0) + 1;
    });

    const totalRevenue = bookings.reduce((s, b) => s + Number(b.totalAmount), 0);

    return {
      summary: {
        totalRevenue,
        totalBookings: bookings.length,
        avgPerBooking: bookings.length > 0 ? totalRevenue / bookings.length : 0,
      },
      revenueChart: Object.entries(revenueByDate).map(([date, revenue]) => ({
        date,
        revenue,
        bookings: bookingsByDate[date] || 0,
      })),
      topCourts: Object.values(courtRevenue).sort((a, b) => b.revenue - a.revenue).slice(0, 8),
      byBranch: Object.values(branchRevenue).sort((a, b) => b.revenue - a.revenue),
      bySport: Object.entries(sportCount).map(([name, count]) => ({ name, count })),
      byStatus: Object.entries(statusCount).map(([status, count]) => ({ status, count })),
      peakHours: Object.entries(hourCount)
        .map(([h, count]) => ({ hour: `${String(h).padStart(2, '0')}:00`, count }))
        .sort((a, b) => a.hour.localeCompare(b.hour)),
    };
  }

  // ── Courts ────────────────────────────────────────────────────────

  async getCourts(businessId: string, branchId?: string) {
    return this.prisma.court.findMany({
      where: { branch: { businessId }, ...(branchId && { branchId }) },
      include: {
        sports: true,
        branch: { select: { id: true, name: true, city: true } },
        pricingRules: { where: { isActive: true }, orderBy: { priority: 'desc' } },
        schedules: { orderBy: { dayOfWeek: 'asc' } },
        _count: { select: { bookings: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getCourt(id: string, businessId: string) {
    const court = await this.prisma.court.findFirst({
      where: { id, branch: { businessId } },
      include: {
        sports: true,
        branch: true,
        pricingRules: { orderBy: { priority: 'desc' } },
        schedules: { orderBy: { dayOfWeek: 'asc' } },
      },
    });
    if (!court) throw new NotFoundException('Court not found');
    return court;
  }

  async createCourt(businessId: string, data: any) {
    const branch = await this.prisma.branch.findFirst({ where: { id: data.branchId, businessId } });
    if (!branch) throw new ForbiddenException('Branch not in your business');
    const { sportIds, ...rest } = data;
    return this.prisma.court.create({
      data: {
        branchId: rest.branchId,
        name: rest.name,
        description: rest.description,
        image: rest.image,
        pricePerHour: rest.pricePerHour,
        size: rest.size,
        minDuration: rest.minDuration || 60,
        maxDuration: rest.maxDuration || 120,
        ...(sportIds?.length && { sports: { connect: sportIds.map((id: string) => ({ id })) } }),
      },
      include: { sports: true, branch: { select: { id: true, name: true } } },
    });
  }

  async updateCourt(id: string, businessId: string, data: any) {
    await this.getCourt(id, businessId);
    const { branchId: _b, sportIds, ...rest } = data;
    return this.prisma.court.update({
      where: { id },
      data: {
        name: rest.name,
        description: rest.description,
        image: rest.image,
        pricePerHour: rest.pricePerHour,
        size: rest.size,
        isActive: rest.isActive,
        minDuration: rest.minDuration,
        maxDuration: rest.maxDuration,
        ...(sportIds && { sports: { set: sportIds.map((id: string) => ({ id })) } }),
      },
      include: { sports: true },
    });
  }

  // ── Pricing Rules ─────────────────────────────────────────────────

  async getPricingRules(courtId: string, businessId: string) {
    await this.getCourt(courtId, businessId);
    return this.prisma.pricingRule.findMany({
      where: { courtId },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async createPricingRule(courtId: string, businessId: string, data: any) {
    await this.getCourt(courtId, businessId);
    return this.prisma.pricingRule.create({
      data: {
        courtId,
        name: data.name,
        pricePerHour: data.pricePerHour,
        dayType: data.dayType || 'ALL',
        startHour: data.startHour ?? 0,
        endHour: data.endHour ?? 24,
        priority: data.priority ?? 0,
        isActive: true,
      },
    });
  }

  async updatePricingRule(ruleId: string, businessId: string, data: any) {
    const rule = await this.prisma.pricingRule.findFirst({
      where: { id: ruleId, court: { branch: { businessId } } },
    });
    if (!rule) throw new NotFoundException('Pricing rule not found');
    return this.prisma.pricingRule.update({
      where: { id: ruleId },
      data: {
        name: data.name,
        pricePerHour: data.pricePerHour,
        dayType: data.dayType,
        startHour: data.startHour,
        endHour: data.endHour,
        priority: data.priority,
        isActive: data.isActive,
      },
    });
  }

  async deletePricingRule(ruleId: string, businessId: string) {
    const rule = await this.prisma.pricingRule.findFirst({
      where: { id: ruleId, court: { branch: { businessId } } },
    });
    if (!rule) throw new NotFoundException('Pricing rule not found');
    return this.prisma.pricingRule.delete({ where: { id: ruleId } });
  }

  // ── Court Schedule ────────────────────────────────────────────────

  async getSchedule(courtId: string, businessId: string) {
    await this.getCourt(courtId, businessId);
    const existing = await this.prisma.courtSchedule.findMany({
      where: { courtId },
      orderBy: { dayOfWeek: 'asc' },
    });
    return [0, 1, 2, 3, 4, 5, 6].map((day) => {
      const found = existing.find((s) => s.dayOfWeek === day);
      return found ?? { id: null, courtId, dayOfWeek: day, openTime: '06:00', closeTime: '22:00', isOpen: true };
    });
  }

  async upsertSchedule(courtId: string, businessId: string, schedules: any[]) {
    await this.getCourt(courtId, businessId);
    return Promise.all(
      schedules.map((s) =>
        this.prisma.courtSchedule.upsert({
          where: { courtId_dayOfWeek: { courtId, dayOfWeek: s.dayOfWeek } },
          update: { openTime: s.openTime, closeTime: s.closeTime, isOpen: s.isOpen ?? true },
          create: { courtId, dayOfWeek: s.dayOfWeek, openTime: s.openTime, closeTime: s.closeTime, isOpen: s.isOpen ?? true },
        }),
      ),
    );
  }

  // ── Bookings ──────────────────────────────────────────────────────

  async getBookings(
    businessId: string,
    filters: { status?: string; date?: string; search?: string; courtId?: string; branchId?: string; page?: number; limit?: number },
  ) {
    const { status, date, search, courtId, branchId, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const baseWhere = branchId
      ? { branchId }
      : { branch: { businessId } };

    const where: any = { ...baseWhere };
    if (status) where.status = status;
    if (date) where.date = new Date(date);
    if (courtId) where.courtId = courtId;
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
          customer: true,
          court: { include: { sports: true } },
          branch: { select: { name: true, city: true } },
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

  async createManualBooking(user: { businessId: string; role: string; branchId?: string; name?: string }, dto: any) {
    const court = await this.prisma.court.findFirst({
      where: { id: dto.courtId, branch: { businessId: user.businessId } },
      include: { branch: true },
    });
    if (!court) throw new NotFoundException('Court not found');
    if (user.role === 'STAFF' && court.branchId !== user.branchId) {
      throw new ForbiddenException('Court does not belong to your branch');
    }
    const createdByName = user.name ? `${user.name} (${user.role})` : user.role;
    return this.bookingService.create({ ...dto, source: 'MANUAL', createdByName });
  }

  async updateBookingStatus(bookingId: string, businessId: string, status: string, cancelledByName?: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, branch: { businessId } },
      include: { payment: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: status as any,
        ...(status === 'CANCELLED' && {
          cancelledByName: cancelledByName ?? null,
          cancelledAt: new Date(),
        }),
      },
    });
    if (status === 'CONFIRMED' && booking.payment) {
      await this.prisma.payment.update({
        where: { bookingId },
        data: { status: 'PAID', paidAt: new Date() },
      });
    }
    return updated;
  }

  async getCourtAvailability(courtId: string, date: string, businessId: string) {
    const court = await this.prisma.court.findFirst({
      where: { id: courtId, branch: { businessId } },
      include: { branch: { select: { openTime: true, closeTime: true } } },
    });
    if (!court) throw new NotFoundException('Court not found');

    const branch = court.branch as any;
    const openHour = parseInt(branch.openTime.split(':')[0]);
    const closeHour = parseInt(branch.closeTime.split(':')[0]);

    const bookings = await this.prisma.booking.findMany({
      where: { courtId, date: new Date(date), status: { notIn: ['CANCELLED'] } },
      select: { startTime: true, endTime: true, source: true },
    });

    const slots: { time: string; endTime: string; available: boolean; bookingSource: string | null }[] = [];

    for (let h = openHour; h < closeHour; h++) {
      const startTime = `${String(h).padStart(2, '0')}:00`;
      const endTime = `${String(h + 1).padStart(2, '0')}:00`;
      const slotStart = h * 60;
      const slotEnd = (h + 1) * 60;

      const conflict = bookings.find((b) => {
        const bStart = parseInt(b.startTime.split(':')[0]) * 60 + parseInt(b.startTime.split(':')[1]);
        const bEnd = parseInt(b.endTime.split(':')[0]) * 60 + parseInt(b.endTime.split(':')[1]);
        return slotStart < bEnd && slotEnd > bStart;
      });

      slots.push({ time: startTime, endTime, available: !conflict, bookingSource: conflict ? conflict.source : null });
    }

    return { courtId, date, slots };
  }

  // ── Branches ──────────────────────────────────────────────────────

  async getBranches(businessId: string) {
    return this.prisma.branch.findMany({
      where: { businessId },
      include: { _count: { select: { courts: true, bookings: true, staff: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createBranch(businessId: string, data: any) {
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new BadRequestException('Invalid email address');
    }
    return this.prisma.branch.create({
      data: {
        businessId,
        name: data.name,
        address: data.address,
        city: data.city,
        phone: data.phone,
        email: data.email,
        mapUrl: data.mapUrl,
        openTime: data.openTime || '06:00',
        closeTime: data.closeTime || '22:00',
        slotDuration: data.slotDuration || 60,
      },
      include: { _count: { select: { courts: true, bookings: true, staff: true } } },
    });
  }

  async updateBranch(id: string, businessId: string, data: any) {
    const branch = await this.prisma.branch.findFirst({ where: { id, businessId } });
    if (!branch) throw new NotFoundException('Futsal not found');
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new BadRequestException('Invalid email address');
    }
    return this.prisma.branch.update({
      where: { id },
      data: {
        name: data.name,
        address: data.address,
        city: data.city,
        phone: data.phone,
        email: data.email,
        mapUrl: data.mapUrl,
        openTime: data.openTime,
        closeTime: data.closeTime,
        slotDuration: data.slotDuration,
        isActive: data.isActive,
      },
      include: { _count: { select: { courts: true, bookings: true, staff: true } } },
    });
  }

  async deleteBranch(id: string, businessId: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, businessId },
      include: { _count: { select: { courts: true, bookings: true } } },
    });
    if (!branch) throw new NotFoundException('Futsal not found');

    const activeBookings = await this.prisma.booking.count({
      where: { branchId: id, status: { in: ['PENDING', 'CONFIRMED'] } },
    });
    if (activeBookings > 0) {
      throw new BadRequestException(
        'This location has active or upcoming bookings and cannot be deleted. Deactivate it instead.',
      );
    }

    // Soft delete: deactivate the branch and its courts rather than removing history.
    await this.prisma.court.updateMany({ where: { branchId: id }, data: { isActive: false } });
    return this.prisma.branch.update({ where: { id }, data: { isActive: false } });
  }

  // ── Sports ────────────────────────────────────────────────────────

  async getSports() {
    return this.prisma.sport.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  // ── Staff Management (by Owner) ───────────────────────────────────

  async getStaff(businessId: string, branchId?: string) {
    return this.prisma.admin.findMany({
      where: {
        businessId,
        role: 'STAFF',
        ...(branchId ? { branchId } : {}),
      },
      select: {
        id: true, name: true, email: true, role: true, isActive: true,
        branchId: true, createdAt: true,
        branch: { select: { id: true, name: true, city: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createStaff(businessId: string, data: { name: string; email: string; password: string; branchId: string }) {
    const branch = await this.prisma.branch.findFirst({ where: { id: data.branchId, businessId } });
    if (!branch) throw new ForbiddenException('Branch not in your business');

    const existing = await this.prisma.admin.findUnique({ where: { email: data.email } });
    if (existing) throw new BadRequestException('Email already in use');

    const hashed = await bcrypt.hash(data.password, 10);
    return this.prisma.admin.create({
      data: {
        businessId,
        name: data.name,
        email: data.email,
        password: hashed,
        role: 'STAFF',
        branchId: data.branchId,
      },
      select: {
        id: true, name: true, email: true, role: true, isActive: true,
        branchId: true, createdAt: true,
        branch: { select: { id: true, name: true, city: true } },
      },
    });
  }

  async updateStaff(staffId: string, businessId: string, data: { name?: string; branchId?: string; isActive?: boolean }) {
    const staff = await this.prisma.admin.findFirst({ where: { id: staffId, businessId, role: 'STAFF' } });
    if (!staff) throw new NotFoundException('Staff member not found');

    if (data.branchId) {
      const branch = await this.prisma.branch.findFirst({ where: { id: data.branchId, businessId } });
      if (!branch) throw new ForbiddenException('Branch not in your business');
    }

    return this.prisma.admin.update({
      where: { id: staffId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.branchId !== undefined && { branchId: data.branchId }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      select: {
        id: true, name: true, email: true, role: true, isActive: true,
        branchId: true, createdAt: true,
        branch: { select: { id: true, name: true, city: true } },
      },
    });
  }

  async resetStaffPassword(staffId: string, businessId: string, newPassword: string) {
    const staff = await this.prisma.admin.findFirst({ where: { id: staffId, businessId, role: 'STAFF' } });
    if (!staff) throw new NotFoundException('Staff member not found');
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.admin.update({ where: { id: staffId }, data: { password: hashed } });
    return { message: 'Password reset successfully' };
  }

  // ── Owner accounts (SUPER_ADMIN) ──────────────────────────────────

  async createOwner(data: { name: string; email: string; password: string; businessId: string }) {
    const existing = await this.prisma.admin.findUnique({ where: { email: data.email } });
    if (existing) throw new BadRequestException('Email already in use');
    const hashed = await bcrypt.hash(data.password, 10);
    return this.prisma.admin.create({
      data: { businessId: data.businessId, name: data.name, email: data.email, password: hashed, role: 'OWNER' },
      select: {
        id: true, name: true, email: true, role: true, isActive: true, createdAt: true,
        business: { select: { id: true, name: true } },
      },
    });
  }

  async getOwners() {
    return this.prisma.admin.findMany({
      where: { role: 'OWNER' },
      select: {
        id: true, name: true, email: true, role: true, isActive: true, createdAt: true,
        business: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleOwnerStatus(ownerId: string) {
    const owner = await this.prisma.admin.findUnique({ where: { id: ownerId } });
    if (!owner || owner.role !== 'OWNER') throw new NotFoundException('Owner not found');
    return this.prisma.admin.update({
      where: { id: ownerId },
      data: { isActive: !owner.isActive },
      select: { id: true, name: true, email: true, isActive: true },
    });
  }

  async updateOwner(ownerId: string, data: { name?: string; email?: string; password?: string; businessId?: string }) {
    const owner = await this.prisma.admin.findUnique({ where: { id: ownerId } });
    if (!owner || owner.role !== 'OWNER') throw new NotFoundException('Owner not found');

    if (data.email && data.email !== owner.email) {
      const existing = await this.prisma.admin.findUnique({ where: { email: data.email } });
      if (existing) throw new BadRequestException('Email already in use');
    }

    const updateData: any = {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.businessId && { businessId: data.businessId }),
    };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.admin.update({
      where: { id: ownerId },
      data: updateData,
      select: {
        id: true, name: true, email: true, role: true, isActive: true, createdAt: true,
        business: { select: { id: true, name: true } },
      },
    });
  }

  async deleteOwner(ownerId: string) {
    const owner = await this.prisma.admin.findUnique({ where: { id: ownerId } });
    if (!owner || owner.role !== 'OWNER') throw new NotFoundException('Owner not found');

    const activeBookings = await this.prisma.booking.count({
      where: { branch: { businessId: owner.businessId }, status: { in: ['PENDING', 'CONFIRMED'] } },
    });
    if (activeBookings > 0) {
      throw new BadRequestException(
        'This owner has active or upcoming bookings and cannot be deleted. Deactivate the account instead.',
      );
    }

    await this.prisma.admin.delete({ where: { id: ownerId } });
    return { message: 'Owner deleted successfully' };
  }

  async getBusinesses() {
    return this.prisma.business.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  // ── Pricing resolution ────────────────────────────────────────────

  async resolvePrice(courtId: string, date: string, startTime: string): Promise<number> {
    const d = new Date(date);
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const hour = parseInt(startTime.split(':')[0]);

    const rules = await this.prisma.pricingRule.findMany({
      where: { courtId, isActive: true },
      orderBy: { priority: 'desc' },
    });

    const match = rules.find((r) => {
      const dayOk =
        r.dayType === 'ALL' ||
        (r.dayType === 'WEEKDAY' && !isWeekend) ||
        (r.dayType === 'WEEKEND' && isWeekend);
      return dayOk && hour >= r.startHour && hour < r.endHour;
    });

    if (match) return Number(match.pricePerHour);
    const court = await this.prisma.court.findUnique({ where: { id: courtId } });
    return Number(court?.pricePerHour || 0);
  }
}
