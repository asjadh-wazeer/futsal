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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettlementController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const settlement_service_1 = require("./settlement.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let SettlementController = class SettlementController {
    constructor(service) {
        this.service = service;
    }
    isAdmin(req) {
        return ['SUPER_ADMIN', 'ADMIN'].includes(req.user?.role);
    }
    findAll(req, status, month) {
        if (this.isAdmin(req)) {
            return this.service.findAll({ status, month });
        }
        if (req.user?.role === 'OWNER') {
            return this.service.getBusinessSettlements(req.user.businessId);
        }
        throw new common_1.ForbiddenException();
    }
    getOutstanding(req) {
        if (!this.isAdmin(req))
            throw new common_1.ForbiddenException();
        return this.service.getOutstandingSummary();
    }
    generate(month, req) {
        if (!this.isAdmin(req))
            throw new common_1.ForbiddenException();
        return this.service.generateForMonth(month);
    }
    markPaid(id, body, req) {
        if (!this.isAdmin(req))
            throw new common_1.ForbiddenException();
        return this.service.markPaid(id, body.notes);
    }
};
exports.SettlementController = SettlementController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], SettlementController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('outstanding'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SettlementController.prototype, "getOutstanding", null);
__decorate([
    (0, common_1.Post)('generate/:month'),
    __param(0, (0, common_1.Param)('month')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SettlementController.prototype, "generate", null);
__decorate([
    (0, common_1.Patch)(':id/mark-paid'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], SettlementController.prototype, "markPaid", null);
exports.SettlementController = SettlementController = __decorate([
    (0, swagger_1.ApiTags)('Settlement'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('settlement'),
    __metadata("design:paramtypes", [settlement_service_1.SettlementService])
], SettlementController);
//# sourceMappingURL=settlement.controller.js.map