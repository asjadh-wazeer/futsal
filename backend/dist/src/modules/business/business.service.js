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
exports.BusinessService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let BusinessService = class BusinessService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOne(id) {
        return this.prisma.business.findUnique({
            where: { id },
            include: { branches: { where: { isActive: true }, select: { id: true, name: true, city: true } } },
        });
    }
    async getPublicSettings(slug) {
        return this.prisma.business.findUnique({
            where: { slug },
            select: {
                id: true, name: true, slug: true, logo: true, description: true,
                primaryColor: true, accentColor: true, phone: true, email: true,
                currency: true,
                branches: { where: { isActive: true }, select: { id: true, name: true, city: true, address: true, phone: true, openTime: true, closeTime: true } },
            },
        });
    }
    async update(id, data) {
        return this.prisma.business.update({ where: { id }, data });
    }
};
exports.BusinessService = BusinessService;
exports.BusinessService = BusinessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BusinessService);
//# sourceMappingURL=business.service.js.map