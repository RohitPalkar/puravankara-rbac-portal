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
exports.UserZoneController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const user_zone_service_1 = require("../services/user-zone.service");
class AssignZoneDto {
    userId;
    zoneId;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AssignZoneDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], AssignZoneDto.prototype, "zoneId", void 0);
let UserZoneController = class UserZoneController {
    zoneService;
    constructor(zoneService) {
        this.zoneService = zoneService;
    }
    async findByUser(userId) {
        return this.zoneService.findByUser(userId);
    }
    async assign(dto) {
        return this.zoneService.assign(dto.userId, dto.zoneId);
    }
    async revoke(userId, zoneId) {
        await this.zoneService.revoke(userId, zoneId);
        return { message: 'Zone revoked from user' };
    }
};
exports.UserZoneController = UserZoneController;
__decorate([
    (0, common_1.Get)(':userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get zones for a user' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserZoneController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Assign zone to user' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AssignZoneDto]),
    __metadata("design:returntype", Promise)
], UserZoneController.prototype, "assign", null);
__decorate([
    (0, common_1.Delete)(':userId/zone/:zoneId'),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke zone from user' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('zoneId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], UserZoneController.prototype, "revoke", null);
exports.UserZoneController = UserZoneController = __decorate([
    (0, swagger_1.ApiTags)('Users - Zones'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('user-zones'),
    __metadata("design:paramtypes", [user_zone_service_1.UserZoneService])
], UserZoneController);
//# sourceMappingURL=user-zone.controller.js.map