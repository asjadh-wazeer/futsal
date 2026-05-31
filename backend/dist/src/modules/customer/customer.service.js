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
exports.CustomerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CustomerService = class CustomerService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(search) {
        return this.prisma.customer.findMany({
            where: search
                ? {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { phone: { contains: search } },
                        { email: { contains: search, mode: 'insensitive' } },
                    ],
                }
                : undefined,
            include: { _count: { select: { bookings: true } } },
            orderBy: { totalSpent: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.customer.findUnique({
            where: { id },
            include: {
                bookings: {
                    include: { court: { include: { sport: true } }, branch: true, payment: true },
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
            },
        });
    }
    async findOrCreate(phone, name, email) {
        let customer = await this.prisma.customer.findUnique({ where: { phone } });
        if (!customer) {
            customer = await this.prisma.customer.create({ data: { phone, name, email } });
        }
        return customer;
    }
    async updateSpending(customerId, amount) {
        return this.prisma.customer.update({
            where: { id: customerId },
            data: {
                totalSpent: { increment: amount },
                visitCount: { increment: 1 },
            },
        });
    }
};
exports.CustomerService = CustomerService;
exports.CustomerService = CustomerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomerService);
//# sourceMappingURL=customer.service.js.map