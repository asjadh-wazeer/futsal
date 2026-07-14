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
exports.OwnerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const owner_service_1 = require("./owner.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let OwnerController = class OwnerController {
    constructor(service) {
        this.service = service;
    }
    getDashboard(req, branchId) {
        const effectiveBranchId = req.user.role === 'STAFF' ? req.user.branchId : (branchId || undefined);
        return this.service.getDashboard(req.user.businessId, effectiveBranchId);
    }
    getAnalytics(req, period, from, to, branchId) {
        const effectiveBranchId = req.user.role === 'STAFF' ? req.user.branchId : (branchId || undefined);
        return this.service.getAnalytics(req.user.businessId, { period, from, to, branchId: effectiveBranchId });
    }
    getCourts(req) {
        const branchId = req.user.role === 'STAFF' ? req.user.branchId : undefined;
        return this.service.getCourts(req.user.businessId, branchId);
    }
    createCourt(req, body) {
        return this.service.createCourt(req.user.businessId, body);
    }
    getCourt(req, id) {
        return this.service.getCourt(id, req.user.businessId);
    }
    updateCourt(req, id, body) {
        return this.service.updateCourt(id, req.user.businessId, body);
    }
    getPricingRules(req, id) {
        return this.service.getPricingRules(id, req.user.businessId);
    }
    createPricingRule(req, id, body) {
        return this.service.createPricingRule(id, req.user.businessId, body);
    }
    updatePricingRule(req, ruleId, body) {
        return this.service.updatePricingRule(ruleId, req.user.businessId, body);
    }
    deletePricingRule(req, ruleId) {
        return this.service.deletePricingRule(ruleId, req.user.businessId);
    }
    getSchedule(req, id) {
        return this.service.getSchedule(id, req.user.businessId);
    }
    upsertSchedule(req, id, body) {
        return this.service.upsertSchedule(id, req.user.businessId, body.schedules);
    }
    getBookings(req, status, date, search, courtId, branchId, page, limit) {
        const effectiveBranchId = req.user.role === 'STAFF' ? req.user.branchId : (branchId || undefined);
        return this.service.getBookings(req.user.businessId, {
            status, date, search, courtId,
            branchId: effectiveBranchId,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
        });
    }
    getCourtAvailability(req, id, date) {
        return this.service.getCourtAvailability(id, date, req.user.businessId);
    }
    createManualBooking(req, body) {
        return this.service.createManualBooking({ businessId: req.user.businessId, role: req.user.role, branchId: req.user.branchId, name: req.user.name }, body);
    }
    updateBookingStatus(req, id, body) {
        const cancelledByName = body.status === 'CANCELLED'
            ? `${req.user.name} (${req.user.role})`
            : undefined;
        return this.service.updateBookingStatus(id, req.user.businessId, body.status, cancelledByName);
    }
    getBranches(req) {
        return this.service.getBranches(req.user.businessId);
    }
    createBranch(req, body) {
        return this.service.createBranch(req.user.businessId, body);
    }
    updateBranch(req, id, body) {
        return this.service.updateBranch(id, req.user.businessId, body);
    }
    deleteBranch(req, id) {
        return this.service.deleteBranch(id, req.user.businessId);
    }
    getSports() {
        return this.service.getSports();
    }
    getStaff(req, branchId) {
        return this.service.getStaff(req.user.businessId, branchId || undefined);
    }
    createStaff(req, body) {
        return this.service.createStaff(req.user.businessId, body);
    }
    updateStaff(req, id, body) {
        return this.service.updateStaff(id, req.user.businessId, body);
    }
    resetStaffPassword(req, id, body) {
        return this.service.resetStaffPassword(id, req.user.businessId, body.newPassword);
    }
    createOwner(body) {
        return this.service.createOwner(body);
    }
    getOwners() {
        return this.service.getOwners();
    }
    toggleOwnerStatus(id) {
        return this.service.toggleOwnerStatus(id);
    }
    updateOwner(id, body) {
        return this.service.updateOwner(id, body);
    }
    deleteOwner(id) {
        return this.service.deleteOwner(id);
    }
    getBusinesses() {
        return this.service.getBusinesses();
    }
};
exports.OwnerController = OwnerController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('analytics'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('period')),
    __param(2, (0, common_1.Query)('from')),
    __param(3, (0, common_1.Query)('to')),
    __param(4, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('courts'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "getCourts", null);
__decorate([
    (0, common_1.Post)('courts'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "createCourt", null);
__decorate([
    (0, common_1.Get)('courts/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "getCourt", null);
__decorate([
    (0, common_1.Patch)('courts/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "updateCourt", null);
__decorate([
    (0, common_1.Get)('courts/:id/pricing'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "getPricingRules", null);
__decorate([
    (0, common_1.Post)('courts/:id/pricing'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "createPricingRule", null);
__decorate([
    (0, common_1.Patch)('courts/:courtId/pricing/:ruleId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('ruleId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "updatePricingRule", null);
__decorate([
    (0, common_1.Delete)('courts/:courtId/pricing/:ruleId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('ruleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "deletePricingRule", null);
__decorate([
    (0, common_1.Get)('courts/:id/schedule'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "getSchedule", null);
__decorate([
    (0, common_1.Put)('courts/:id/schedule'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "upsertSchedule", null);
__decorate([
    (0, common_1.Get)('bookings'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('date')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('courtId')),
    __param(5, (0, common_1.Query)('branchId')),
    __param(6, (0, common_1.Query)('page')),
    __param(7, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "getBookings", null);
__decorate([
    (0, common_1.Get)('courts/:id/availability'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "getCourtAvailability", null);
__decorate([
    (0, common_1.Post)('bookings/manual'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "createManualBooking", null);
__decorate([
    (0, common_1.Patch)('bookings/:id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "updateBookingStatus", null);
__decorate([
    (0, common_1.Get)('branches'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "getBranches", null);
__decorate([
    (0, common_1.Post)('branches'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "createBranch", null);
__decorate([
    (0, common_1.Patch)('branches/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "updateBranch", null);
__decorate([
    (0, common_1.Delete)('branches/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "deleteBranch", null);
__decorate([
    (0, common_1.Get)('sports'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "getSports", null);
__decorate([
    (0, common_1.Get)('staff'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "getStaff", null);
__decorate([
    (0, common_1.Post)('staff'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "createStaff", null);
__decorate([
    (0, common_1.Patch)('staff/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "updateStaff", null);
__decorate([
    (0, common_1.Post)('staff/:id/reset-password'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "resetStaffPassword", null);
__decorate([
    (0, common_1.Post)('manage/owners'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "createOwner", null);
__decorate([
    (0, common_1.Get)('manage/owners'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "getOwners", null);
__decorate([
    (0, common_1.Patch)('manage/owners/:id/toggle'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "toggleOwnerStatus", null);
__decorate([
    (0, common_1.Patch)('manage/owners/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "updateOwner", null);
__decorate([
    (0, common_1.Delete)('manage/owners/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "deleteOwner", null);
__decorate([
    (0, common_1.Get)('manage/businesses'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OwnerController.prototype, "getBusinesses", null);
exports.OwnerController = OwnerController = __decorate([
    (0, swagger_1.ApiTags)('Owner'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('owner'),
    __metadata("design:paramtypes", [owner_service_1.OwnerService])
], OwnerController);
//# sourceMappingURL=owner.controller.js.map