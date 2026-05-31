"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SportModule = void 0;
const common_1 = require("@nestjs/common");
const sport_controller_1 = require("./sport.controller");
const sport_service_1 = require("./sport.service");
let SportModule = class SportModule {
};
exports.SportModule = SportModule;
exports.SportModule = SportModule = __decorate([
    (0, common_1.Module)({
        controllers: [sport_controller_1.SportController],
        providers: [sport_service_1.SportService],
        exports: [sport_service_1.SportService],
    })
], SportModule);
//# sourceMappingURL=sport.module.js.map