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
exports.SetupController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const setup_service_1 = require("./setup.service");
const public_decorator_1 = require("../../modules/auth/decorators/public.decorator");
let SetupController = class SetupController {
    setupService;
    constructor(setupService) {
        this.setupService = setupService;
    }
    async getStatus() {
        return this.setupService.getStatus();
    }
    async reset() {
        await this.setupService.reset();
        return { message: 'Reset complete: zones (4), cities seeded, non-admin users removed' };
    }
};
exports.SetupController = SetupController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system setup status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SetupController.prototype, "getStatus", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('reset'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset zones, cities, and non-admin users' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SetupController.prototype, "reset", null);
exports.SetupController = SetupController = __decorate([
    (0, swagger_1.ApiTags)('Setup'),
    (0, common_1.Controller)('setup'),
    __metadata("design:paramtypes", [setup_service_1.SetupService])
], SetupController);
//# sourceMappingURL=setup.controller.js.map