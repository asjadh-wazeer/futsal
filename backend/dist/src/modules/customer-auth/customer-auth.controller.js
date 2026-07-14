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
exports.CustomerAuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const customer_auth_service_1 = require("./customer-auth.service");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
const customer_jwt_guard_1 = require("./guards/customer-jwt.guard");
let CustomerAuthController = class CustomerAuthController {
    constructor(service) {
        this.service = service;
    }
    register(dto) {
        return this.service.register(dto);
    }
    login(dto) {
        return this.service.login(dto);
    }
    googleLogin() { }
    async googleCallback(req, res) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        try {
            const result = await this.service.googleLogin(req.user);
            res.redirect(`${frontendUrl}/auth/callback?token=${result.access_token}&name=${encodeURIComponent(result.customer.name)}`);
        }
        catch (err) {
            res.redirect(`${frontendUrl}/login?error=google_signin_failed`);
        }
    }
    getProfile(req) {
        return this.service.getProfile(req.user.sub);
    }
    updateProfile(req, body) {
        return this.service.updateProfile(req.user.sub, body);
    }
};
exports.CustomerAuthController = CustomerAuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", void 0)
], CustomerAuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", void 0)
], CustomerAuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('google'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('google')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomerAuthController.prototype, "googleLogin", null);
__decorate([
    (0, common_1.Get)('google/callback'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('google')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerAuthController.prototype, "googleCallback", null);
__decorate([
    (0, common_1.UseGuards)(customer_jwt_guard_1.CustomerJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CustomerAuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)(customer_jwt_guard_1.CustomerJwtGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)('profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CustomerAuthController.prototype, "updateProfile", null);
exports.CustomerAuthController = CustomerAuthController = __decorate([
    (0, swagger_1.ApiTags)('Customer Auth'),
    (0, common_1.Controller)('customer-auth'),
    __metadata("design:paramtypes", [customer_auth_service_1.CustomerAuthService])
], CustomerAuthController);
//# sourceMappingURL=customer-auth.controller.js.map