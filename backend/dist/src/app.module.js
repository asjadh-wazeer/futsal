"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const business_module_1 = require("./modules/business/business.module");
const branch_module_1 = require("./modules/branch/branch.module");
const sport_module_1 = require("./modules/sport/sport.module");
const court_module_1 = require("./modules/court/court.module");
const booking_module_1 = require("./modules/booking/booking.module");
const customer_module_1 = require("./modules/customer/customer.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const payment_module_1 = require("./modules/payment/payment.module");
const customer_auth_module_1 = require("./modules/customer-auth/customer-auth.module");
const owner_module_1 = require("./modules/owner/owner.module");
const notification_module_1 = require("./modules/notification/notification.module");
const settlement_module_1 = require("./modules/settlement/settlement.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            business_module_1.BusinessModule,
            branch_module_1.BranchModule,
            sport_module_1.SportModule,
            court_module_1.CourtModule,
            booking_module_1.BookingModule,
            customer_module_1.CustomerModule,
            analytics_module_1.AnalyticsModule,
            payment_module_1.PaymentModule,
            customer_auth_module_1.CustomerAuthModule,
            owner_module_1.OwnerModule,
            notification_module_1.NotificationModule,
            settlement_module_1.SettlementModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map