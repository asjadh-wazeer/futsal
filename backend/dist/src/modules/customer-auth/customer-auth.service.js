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
exports.CustomerAuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const prisma_service_1 = require("../../prisma/prisma.service");
let CustomerAuthService = class CustomerAuthService {
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    sign(customer) {
        return this.jwt.sign({
            sub: customer.id,
            email: customer.email,
            type: 'customer',
        });
    }
    async register(dto) {
        const existing = await this.prisma.customer.findFirst({
            where: {
                OR: [
                    dto.email ? { email: dto.email } : {},
                    dto.phone ? { phone: dto.phone } : {},
                ].filter((x) => Object.keys(x).length > 0),
            },
        });
        if (existing) {
            throw new common_1.ConflictException(existing.email === dto.email
                ? 'An account with this email already exists'
                : 'An account with this phone number already exists');
        }
        const hashed = await bcrypt.hash(dto.password, 10);
        const customer = await this.prisma.customer.create({
            data: {
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                password: hashed,
                isVerified: false,
            },
        });
        return { access_token: this.sign(customer), customer: this.sanitize(customer) };
    }
    async login(dto) {
        const customer = await this.prisma.customer.findFirst({
            where: {
                OR: [
                    dto.identifier.includes('@') ? { email: dto.identifier } : {},
                    !dto.identifier.includes('@') ? { phone: dto.identifier } : {},
                ].filter((x) => Object.keys(x).length > 0),
            },
        });
        if (!customer || !customer.password) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const valid = await bcrypt.compare(dto.password, customer.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        return { access_token: this.sign(customer), customer: this.sanitize(customer) };
    }
    async googleLogin(googleUser) {
        let customer = await this.prisma.customer.findFirst({
            where: {
                OR: [
                    { googleId: googleUser.googleId },
                    googleUser.email ? { email: googleUser.email } : {},
                ].filter((x) => Object.keys(x).length > 0),
            },
        });
        if (!customer) {
            customer = await this.prisma.customer.create({
                data: {
                    name: googleUser.name,
                    email: googleUser.email,
                    googleId: googleUser.googleId,
                    avatarUrl: googleUser.picture,
                    isVerified: true,
                },
            });
        }
        else if (!customer.googleId) {
            customer = await this.prisma.customer.update({
                where: { id: customer.id },
                data: { googleId: googleUser.googleId, avatarUrl: googleUser.picture, isVerified: true },
            });
        }
        return { access_token: this.sign(customer), customer: this.sanitize(customer) };
    }
    async getProfile(customerId) {
        const customer = await this.prisma.customer.findUnique({
            where: { id: customerId },
            include: {
                bookings: {
                    include: {
                        court: { include: { sports: true } },
                        branch: { select: { name: true, city: true } },
                        payment: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
            },
        });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        return { ...this.sanitize(customer), bookings: customer.bookings };
    }
    async updateProfile(customerId, data) {
        const customer = await this.prisma.customer.update({
            where: { id: customerId },
            data,
        });
        return this.sanitize(customer);
    }
    sanitize(c) {
        const { password, ...rest } = c;
        return rest;
    }
};
exports.CustomerAuthService = CustomerAuthService;
exports.CustomerAuthService = CustomerAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], CustomerAuthService);
//# sourceMappingURL=customer-auth.service.js.map