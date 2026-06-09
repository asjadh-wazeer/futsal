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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const prisma_service_1 = require("../../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async login(dto) {
        const admin = await this.prisma.admin.findUnique({
            where: { email: dto.email },
            include: { business: true },
        });
        if (!admin || !admin.isActive) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const valid = await bcrypt.compare(dto.password, admin.password);
        if (!valid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = { sub: admin.id, email: admin.email, role: admin.role, businessId: admin.businessId, branchId: admin.branchId ?? null };
        const token = this.jwt.sign(payload);
        return {
            access_token: token,
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                branchId: admin.branchId ?? null,
                business: {
                    id: admin.business.id,
                    name: admin.business.name,
                    logo: admin.business.logo,
                    primaryColor: admin.business.primaryColor,
                },
            },
        };
    }
    async getProfile(adminId) {
        return this.prisma.admin.findUnique({
            where: { id: adminId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                branchId: true,
                business: {
                    select: { id: true, name: true, logo: true, primaryColor: true, currency: true },
                },
            },
        });
    }
    async changePassword(adminId, oldPassword, newPassword) {
        const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
        const valid = await bcrypt.compare(oldPassword, admin.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Old password incorrect');
        const hashed = await bcrypt.hash(newPassword, 10);
        await this.prisma.admin.update({ where: { id: adminId }, data: { password: hashed } });
        return { message: 'Password updated successfully' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map