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
exports.CityZoneMappingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const city_zone_mapping_service_1 = require("../services/city-zone-mapping.service");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
class CityZoneMappingDto {
    cityId;
    zoneId;
}
__decorate([
    (0, swagger_2.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CityZoneMappingDto.prototype, "cityId", void 0);
__decorate([
    (0, swagger_2.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CityZoneMappingDto.prototype, "zoneId", void 0);
let CityZoneMappingController = class CityZoneMappingController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    async findAll() {
        return this.svc.findAll();
    }
    async create(dto) {
        return this.svc.create(dto);
    }
    async remove(cityId, zoneId) {
        await this.svc.remove(+cityId, +zoneId);
        return { message: 'Mapping deleted' };
    }
};
exports.CityZoneMappingController = CityZoneMappingController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all city-zone mappings' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CityZoneMappingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a city-zone mapping' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CityZoneMappingDto]),
    __metadata("design:returntype", Promise)
], CityZoneMappingController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':cityId/zone/:zoneId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a city-zone mapping' }),
    __param(0, (0, common_1.Param)('cityId')),
    __param(1, (0, common_1.Param)('zoneId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CityZoneMappingController.prototype, "remove", null);
exports.CityZoneMappingController = CityZoneMappingController = __decorate([
    (0, swagger_1.ApiTags)('Geography - City Zone Mappings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('city-zone-mappings'),
    __metadata("design:paramtypes", [city_zone_mapping_service_1.CityZoneMappingService])
], CityZoneMappingController);
//# sourceMappingURL=city-zone-mapping.controller.js.map