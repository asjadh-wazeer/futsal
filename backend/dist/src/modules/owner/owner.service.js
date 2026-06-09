"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnerService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcryptjs");
const prisma_service_1 = require("../../prisma/prisma.service");
let OwnerService = class OwnerService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard(businessId, branchId) {
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
        const [todayStats, weekStats, monthStats, totalCustomers, recentBookings, courtStats, todayBookings, branches] = await Promise.all([
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
    async getAnalytics(businessId, params) {
        const { period = 'month', from, to, branchId } = params;
        const now = new Date();
        let startDate;
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
                if (!from || !to)
                    throw new common_1.BadRequestException('from and to required for custom period');
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
        const revenueByDate = {};
        const bookingsByDate = {};
        const courtRevenue = {};
        const branchRevenue = {};
        const sportCount = {};
        const statusCount = {};
        const hourCount = {};
        bookings.forEach((b) => {
            const key = period === 'year'
                ? b.date.toISOString().substring(0, 7)
                : b.date.toISOString().substring(0, 10);
            revenueByDate[key] = (revenueByDate[key] || 0) + Number(b.totalAmount);
            bookingsByDate[key] = (bookingsByDate[key] || 0) + 1;
            if (!courtRevenue[b.courtId]) {
                courtRevenue[b.courtId] = { name: b.court?.name || b.courtId, revenue: 0, count: 0 };
            }
            courtRevenue[b.courtId].revenue += Number(b.totalAmount);
            courtRevenue[b.courtId].count += 1;
            const branchName = b.branch?.name || b.branchId;
            if (!branchRevenue[b.branchId]) {
                branchRevenue[b.branchId] = { name: branchName, revenue: 0, count: 0 };
            }
            branchRevenue[b.branchId].revenue += Number(b.totalAmount);
            branchRevenue[b.branchId].count += 1;
            const sport = b.sport?.name || 'General';
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
    async getCourts(businessId) {
        return this.prisma.court.findMany({
            where: { branch: { businessId } },
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
    async getCourt(id, businessId) {
        const court = await this.prisma.court.findFirst({
            where: { id, branch: { businessId } },
            include: {
                sports: true,
                branch: true,
                pricingRules: { orderBy: { priority: 'desc' } },
                schedules: { orderBy: { dayOfWeek: 'asc' } },
            },
        });
        if (!court)
            throw new common_1.NotFoundException('Court not found');
        return court;
    }
    async createCourt(businessId, data) {
        const branch = await this.prisma.branch.findFirst({ where: { id: data.branchId, businessId } });
        if (!branch)
            throw new common_1.ForbiddenException('Branch not in your business');
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
                ...(sportIds?.length && { sports: { connect: sportIds.map((id) => ({ id })) } }),
            },
            include: { sports: true, branch: { select: { id: true, name: true } } },
        });
    }
    async updateCourt(id, businessId, data) {
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
                ...(sportIds && { sports: { set: sportIds.map((id) => ({ id })) } }),
            },
            include: { sports: true },
        });
    }
    async getPricingRules(courtId, businessId) {
        await this.getCourt(courtId, businessId);
        return this.prisma.pricingRule.findMany({
            where: { courtId },
            orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
        });
    }
    async createPricingRule(courtId, businessId, data) {
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
    async updatePricingRule(ruleId, businessId, data) {
        const rule = await this.prisma.pricingRule.findFirst({
            where: { id: ruleId, court: { branch: { businessId } } },
        });
        if (!rule)
            throw new common_1.NotFoundException('Pricing rule not found');
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
    async deletePricingRule(ruleId, businessId) {
        const rule = await this.prisma.pricingRule.findFirst({
            where: { id: ruleId, court: { branch: { businessId } } },
        });
        if (!rule)
            throw new common_1.NotFoundException('Pricing rule not found');
        return this.prisma.pricingRule.delete({ where: { id: ruleId } });
    }
    async getSchedule(courtId, businessId) {
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
    async upsertSchedule(courtId, businessId, schedules) {
        await this.getCourt(courtId, businessId);
        return Promise.all(schedules.map((s) => this.prisma.courtSchedule.upsert({
            where: { courtId_dayOfWeek: { courtId, dayOfWeek: s.dayOfWeek } },
            update: { openTime: s.openTime, closeTime: s.closeTime, isOpen: s.isOpen ?? true },
            create: { courtId, dayOfWeek: s.dayOfWeek, openTime: s.openTime, closeTime: s.closeTime, isOpen: s.isOpen ?? true },
        })));
    }
    async getBookings(businessId, filters) {
        const { status, date, search, courtId, branchId, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;
        const baseWhere = branchId
            ? { branchId }
            : { branch: { businessId } };
        const where = { ...baseWhere };
        if (status)
            where.status = status;
        if (date)
            where.date = new Date(date);
        if (courtId)
            where.courtId = courtId;
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
    async updateBookingStatus(bookingId, businessId, status) {
        const booking = await this.prisma.booking.findFirst({
            where: { id: bookingId, branch: { businessId } },
            include: { payment: true },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        const updated = await this.prisma.booking.update({
            where: { id: bookingId },
            data: { status: status },
        });
        if (status === 'CONFIRMED' && booking.payment) {
            await this.prisma.payment.update({
                where: { bookingId },
                data: { status: 'PAID', paidAt: new Date() },
            });
        }
        return updated;
    }
    async getBranches(businessId) {
        return this.prisma.branch.findMany({
            where: { businessId },
            include: { _count: { select: { courts: true, bookings: true, staff: true } } },
            orderBy: { createdAt: 'asc' },
        });
    }
    async createBranch(businessId, data) {
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
    async updateBranch(id, businessId, data) {
        const branch = await this.prisma.branch.findFirst({ where: { id, businessId } });
        if (!branch)
            throw new common_1.NotFoundException('Futsal not found');
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
    async getSports() {
        return this.prisma.sport.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
    }
    async getStaff(businessId, branchId) {
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
    async createStaff(businessId, data) {
        const branch = await this.prisma.branch.findFirst({ where: { id: data.branchId, businessId } });
        if (!branch)
            throw new common_1.ForbiddenException('Branch not in your business');
        const existing = await this.prisma.admin.findUnique({ where: { email: data.email } });
        if (existing)
            throw new common_1.BadRequestException('Email already in use');
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
    async updateStaff(staffId, businessId, data) {
        const staff = await this.prisma.admin.findFirst({ where: { id: staffId, businessId, role: 'STAFF' } });
        if (!staff)
            throw new common_1.NotFoundException('Staff member not found');
        if (data.branchId) {
            const branch = await this.prisma.branch.findFirst({ where: { id: data.branchId, businessId } });
            if (!branch)
                throw new common_1.ForbiddenException('Branch not in your business');
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
    async resetStaffPassword(staffId, businessId, newPassword) {
        const staff = await this.prisma.admin.findFirst({ where: { id: staffId, businessId, role: 'STAFF' } });
        if (!staff)
            throw new common_1.NotFoundException('Staff member not found');
        const hashed = await bcrypt.hash(newPassword, 10);
        await this.prisma.admin.update({ where: { id: staffId }, data: { password: hashed } });
        return { message: 'Password reset successfully' };
    }
    async createOwner(data) {
        const existing = await this.prisma.admin.findUnique({ where: { email: data.email } });
        if (existing)
            throw new common_1.BadRequestException('Email already in use');
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
    async toggleOwnerStatus(ownerId) {
        const owner = await this.prisma.admin.findUnique({ where: { id: ownerId } });
        if (!owner || owner.role !== 'OWNER')
            throw new common_1.NotFoundException('Owner not found');
        return this.prisma.admin.update({
            where: { id: ownerId },
            data: { isActive: !owner.isActive },
            select: { id: true, name: true, email: true, isActive: true },
        });
    }
    async getBusinesses() {
        return this.prisma.business.findMany({
            where: { isActive: true },
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        });
    }
    async resolvePrice(courtId, date, startTime) {
        const d = new Date(date);
        const dow = d.getDay();
        const isWeekend = dow === 0 || dow === 6;
        const hour = parseInt(startTime.split(':')[0]);
        const rules = await this.prisma.pricingRule.findMany({
            where: { courtId, isActive: true },
            orderBy: { priority: 'desc' },
        });
        const match = rules.find((r) => {
            const dayOk = r.dayType === 'ALL' ||
                (r.dayType === 'WEEKDAY' && !isWeekend) ||
                (r.dayType === 'WEEKEND' && isWeekend);
            return dayOk && hour >= r.startHour && hour < r.endHour;
        });
        if (match)
            return Number(match.pricePerHour);
        const court = await this.prisma.court.findUnique({ where: { id: courtId } });
        return Number(court?.pricePerHour || 0);
    }
};
exports.OwnerService = OwnerService;
exports.OwnerService = OwnerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OwnerService);
//# sourceMappingURL=owner.service.js.map