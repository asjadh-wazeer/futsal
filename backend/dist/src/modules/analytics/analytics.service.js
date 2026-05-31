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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard(businessId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const [todayBookings, monthBookings, totalCustomers, branches, recentBookings, courtUtilization,] = await Promise.all([
            this.prisma.booking.aggregate({
                where: { date: { gte: today, lt: tomorrow }, status: { notIn: ['CANCELLED'] } },
                _count: true,
                _sum: { totalAmount: true },
            }),
            this.prisma.booking.aggregate({
                where: { date: { gte: startOfMonth }, status: { notIn: ['CANCELLED'] } },
                _count: true,
                _sum: { totalAmount: true },
            }),
            this.prisma.customer.count(),
            this.prisma.branch.count({ where: { isActive: true } }),
            this.prisma.booking.findMany({
                where: { status: { notIn: ['CANCELLED'] } },
                include: { customer: true, court: { include: { sport: true } }, branch: { select: { name: true } } },
                orderBy: { createdAt: 'desc' },
                take: 8,
            }),
            this.prisma.court.findMany({
                where: { isActive: true },
                include: {
                    sport: true,
                    _count: { select: { bookings: true } },
                },
                orderBy: { name: 'asc' },
            }),
        ]);
        return {
            todayBookings: todayBookings._count,
            todayRevenue: Number(todayBookings._sum.totalAmount || 0),
            monthBookings: monthBookings._count,
            monthRevenue: Number(monthBookings._sum.totalAmount || 0),
            totalCustomers,
            activeBranches: branches,
            recentBookings,
            courtUtilization,
        };
    }
    async getRevenueChart(businessId, period = 'month') {
        const now = new Date();
        let startDate;
        let groupBy;
        if (period === 'week') {
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 6);
        }
        else if (period === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        else {
            startDate = new Date(now.getFullYear(), 0, 1);
        }
        const bookings = await this.prisma.booking.findMany({
            where: {
                date: { gte: startDate },
                status: { notIn: ['CANCELLED'] },
                branch: { businessId },
            },
            select: { date: true, totalAmount: true },
            orderBy: { date: 'asc' },
        });
        const grouped = {};
        bookings.forEach((b) => {
            const key = period === 'year'
                ? b.date.toISOString().substring(0, 7)
                : b.date.toISOString().substring(0, 10);
            grouped[key] = (grouped[key] || 0) + Number(b.totalAmount);
        });
        return Object.entries(grouped).map(([date, revenue]) => ({ date, revenue }));
    }
    async getBookingStats(businessId) {
        const [byStatus, bySport, byBranch, peakHours] = await Promise.all([
            this.prisma.booking.groupBy({
                by: ['status'],
                where: { branch: { businessId } },
                _count: true,
            }),
            this.prisma.booking.findMany({
                where: { branch: { businessId } },
                include: { court: { include: { sport: { select: { name: true } } } } },
            }),
            this.prisma.booking.groupBy({
                by: ['branchId'],
                where: { branch: { businessId } },
                _count: true,
                _sum: { totalAmount: true },
            }),
            this.prisma.booking.findMany({
                where: { branch: { businessId }, status: { notIn: ['CANCELLED'] } },
                select: { startTime: true },
            }),
        ]);
        const sportCounts = {};
        bySport.forEach((b) => {
            const name = b.court?.sport?.name || 'Unknown';
            sportCounts[name] = (sportCounts[name] || 0) + 1;
        });
        const hourCounts = {};
        peakHours.forEach((b) => {
            const hour = b.startTime.split(':')[0];
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });
        const branchIds = byBranch.map((b) => b.branchId);
        const branchNames = await this.prisma.branch.findMany({
            where: { id: { in: branchIds } },
            select: { id: true, name: true },
        });
        const branchMap = Object.fromEntries(branchNames.map((b) => [b.id, b.name]));
        return {
            byStatus,
            bySport: Object.entries(sportCounts).map(([name, count]) => ({ name, count })),
            byBranch: byBranch.map((b) => ({
                branchId: b.branchId,
                name: branchMap[b.branchId] || b.branchId,
                count: b._count,
                revenue: Number(b._sum.totalAmount || 0),
            })),
            peakHours: Object.entries(hourCounts)
                .map(([hour, count]) => ({ hour: `${hour}:00`, count }))
                .sort((a, b) => a.hour.localeCompare(b.hour)),
        };
    }
    async getTopCustomers(businessId) {
        return this.prisma.customer.findMany({
            orderBy: { totalSpent: 'desc' },
            take: 10,
            include: { _count: { select: { bookings: true } } },
        });
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map