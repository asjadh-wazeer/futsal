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
exports.CourtService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CourtService = class CourtService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(branchId, sportId) {
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
    async findOne(id) {
        const court = await this.prisma.court.findUnique({
            where: { id },
            include: { sports: true, branch: true },
        });
        if (!court)
            throw new common_1.NotFoundException('Court not found');
        return court;
    }
    async getAvailability(courtId, date) {
        const court = await this.findOne(courtId);
        const branch = court.branch;
        const openHour = parseInt(branch.openTime.split(':')[0]);
        const closeHour = parseInt(branch.closeTime.split(':')[0]);
        const bookings = await this.prisma.booking.findMany({
            where: {
                courtId,
                date: new Date(date),
                status: { notIn: ['CANCELLED'] },
            },
            select: { startTime: true, endTime: true },
        });
        const bookedRanges = bookings.map((b) => ({ start: b.startTime, end: b.endTime }));
        const slots = [];
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
            slots.push({ time: startTime, endTime, available: !isBooked });
        }
        return { courtId, date, slots };
    }
    async create(data) {
        const { sportIds, ...rest } = data;
        return this.prisma.court.create({
            data: {
                ...rest,
                ...(sportIds?.length && { sports: { connect: sportIds.map((id) => ({ id })) } }),
            },
            include: { sports: true },
        });
    }
    async update(id, data) {
        const { sportIds, ...rest } = data;
        return this.prisma.court.update({
            where: { id },
            data: {
                ...rest,
                ...(sportIds && { sports: { set: sportIds.map((id) => ({ id })) } }),
            },
            include: { sports: true },
        });
    }
    async remove(id) {
        return this.prisma.court.update({ where: { id }, data: { isActive: false } });
    }
};
exports.CourtService = CourtService;
exports.CourtService = CourtService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CourtService);
//# sourceMappingURL=court.service.js.map