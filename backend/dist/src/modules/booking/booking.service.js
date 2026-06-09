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
exports.BookingService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const customer_service_1 = require("../customer/customer.service");
let BookingService = class BookingService {
    constructor(prisma, customerService) {
        this.prisma = prisma;
        this.customerService = customerService;
    }
    generateRef() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let ref = 'FBK-';
        for (let i = 0; i < 8; i++)
            ref += chars[Math.floor(Math.random() * chars.length)];
        return ref;
    }
    async create(dto) {
        const court = await this.prisma.court.findUnique({
            where: { id: dto.courtId },
            include: { branch: true },
        });
        if (!court || !court.isActive)
            throw new common_1.NotFoundException('Court not available');
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
        if (conflict)
            throw new common_1.BadRequestException('This slot is already booked');
        const customer = await this.customerService.findOrCreate(dto.customerPhone, dto.customerName, dto.customerEmail);
        const duration = this.calcDuration(dto.startTime, dto.endTime);
        const pricePerHour = await this.resolvePrice(dto.courtId, dto.date, dto.startTime, Number(court.pricePerHour));
        const totalAmount = (pricePerHour * duration) / 60;
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
                totalAmount,
                notes: dto.notes,
                payment: {
                    create: {
                        amount: totalAmount,
                        method: dto.paymentMethod || client_1.PaymentMethod.CASH,
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
    async resolvePrice(courtId, date, startTime, defaultPrice) {
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
    calcDuration(start, end) {
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        return (eh * 60 + em) - (sh * 60 + sm);
    }
    async findAll(filters) {
        const { branchId, status, date, search, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (branchId)
            where.branchId = branchId;
        if (status)
            where.status = status;
        if (date)
            where.date = new Date(date);
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
    async findByRef(ref) {
        const booking = await this.prisma.booking.findUnique({
            where: { bookingRef: ref },
            include: {
                court: { include: { sports: true } },
                branch: true,
                customer: true,
                payment: true,
            },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        return booking;
    }
    async findOne(id) {
        const booking = await this.prisma.booking.findUnique({
            where: { id },
            include: {
                court: { include: { sports: true } },
                branch: true,
                customer: true,
                payment: true,
            },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        return booking;
    }
    async updateStatus(id, status) {
        const booking = await this.prisma.booking.update({
            where: { id },
            data: { status: status },
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
    async createManual(adminId, dto) {
        return this.create(dto);
    }
    async getTodayBookings(branchId) {
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
};
exports.BookingService = BookingService;
exports.BookingService = BookingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        customer_service_1.CustomerService])
], BookingService);
//# sourceMappingURL=booking.service.js.map