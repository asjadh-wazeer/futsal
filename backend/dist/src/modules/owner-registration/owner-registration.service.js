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
exports.OwnerRegistrationService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcryptjs");
const prisma_service_1 = require("../../prisma/prisma.service");
let OwnerRegistrationService = class OwnerRegistrationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const existing = await this.prisma.ownerRegistration.findFirst({
            where: { email: dto.email, status: { in: ['PENDING', 'APPROVED'] } },
        });
        if (existing)
            throw new common_1.ConflictException('A registration with this email already exists');
        const existingAdmin = await this.prisma.admin.findUnique({ where: { email: dto.email } });
        if (existingAdmin)
            throw new common_1.ConflictException('This email is already registered as an account');
        const password = await bcrypt.hash(dto.password, 10);
        const { password: _, ...rest } = await this.prisma.ownerRegistration.create({
            data: { ...dto, password },
        });
        return rest;
    }
    async findAll() {
        return this.prisma.ownerRegistration.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true, name: true, email: true, phone: true,
                businessName: true, businessCity: true, businessAddress: true,
                businessPhone: true, businessEmail: true,
                status: true, rejectionReason: true, reviewedAt: true, createdAt: true,
            },
        });
    }
    async approve(id) {
        const reg = await this.prisma.ownerRegistration.findUnique({ where: { id } });
        if (!reg)
            throw new common_1.NotFoundException('Registration not found');
        if (reg.status !== 'PENDING')
            throw new common_1.BadRequestException('Registration is not pending');
        const existingAdmin = await this.prisma.admin.findUnique({ where: { email: reg.email } });
        if (existingAdmin) {
            await this.prisma.ownerRegistration.update({ where: { id }, data: { status: 'APPROVED', reviewedAt: new Date() } });
            throw new common_1.BadRequestException('This email already has an account — registration marked approved');
        }
        const slug = this.generateSlug(reg.businessName);
        const business = await this.prisma.business.create({
            data: {
                name: reg.businessName,
                slug,
                phone: reg.businessPhone ?? undefined,
                email: reg.businessEmail ?? undefined,
                address: reg.businessAddress,
                city: reg.businessCity,
                country: 'Sri Lanka',
                currency: 'LKR',
            },
        });
        await this.prisma.admin.create({
            data: {
                businessId: business.id,
                name: reg.name,
                email: reg.email,
                password: reg.password,
                role: 'OWNER',
            },
        });
        return this.prisma.ownerRegistration.update({
            where: { id },
            data: { status: 'APPROVED', reviewedAt: new Date() },
            select: {
                id: true, name: true, email: true, businessName: true,
                status: true, reviewedAt: true,
            },
        });
    }
    async reject(id, reason) {
        const reg = await this.prisma.ownerRegistration.findUnique({ where: { id } });
        if (!reg)
            throw new common_1.NotFoundException('Registration not found');
        if (reg.status !== 'PENDING')
            throw new common_1.BadRequestException('Registration is not pending');
        return this.prisma.ownerRegistration.update({
            where: { id },
            data: { status: 'REJECTED', rejectionReason: reason ?? null, reviewedAt: new Date() },
            select: {
                id: true, name: true, email: true, businessName: true,
                status: true, rejectionReason: true, reviewedAt: true,
            },
        });
    }
    generateSlug(name) {
        const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return `${base}-${Date.now().toString(36)}`;
    }
};
exports.OwnerRegistrationService = OwnerRegistrationService;
exports.OwnerRegistrationService = OwnerRegistrationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OwnerRegistrationService);
//# sourceMappingURL=owner-registration.service.js.map