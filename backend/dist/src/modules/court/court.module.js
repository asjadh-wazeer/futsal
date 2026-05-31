"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourtModule = void 0;
const common_1 = require("@nestjs/common");
const court_controller_1 = require("./court.controller");
const court_service_1 = require("./court.service");
let CourtModule = class CourtModule {
};
exports.CourtModule = CourtModule;
exports.CourtModule = CourtModule = __decorate([
    (0, common_1.Module)({
        controllers: [court_controller_1.CourtController],
        providers: [court_service_1.CourtService],
        exports: [court_service_1.CourtService],
    })
], CourtModule);
//# sourceMappingURL=court.module.js.map