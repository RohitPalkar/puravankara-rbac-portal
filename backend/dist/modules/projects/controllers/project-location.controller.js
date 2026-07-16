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
exports.ProjectLocationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const project_location_service_1 = require("../services/project-location.service");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
class ProjectLocationDto {
    projectId;
    cityId;
    zoneId;
}
__decorate([
    (0, swagger_2.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], ProjectLocationDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_2.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], ProjectLocationDto.prototype, "cityId", void 0);
__decorate([
    (0, swagger_2.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], ProjectLocationDto.prototype, "zoneId", void 0);
let ProjectLocationController = class ProjectLocationController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    async findAll() {
        return this.svc.findAll();
    }
    async findByZone(zoneId) {
        return this.svc.findByZone(+zoneId);
    }
    async findByProject(projectId) {
        return this.svc.findByProject(+projectId);
    }
    async create(dto) {
        return this.svc.create(dto);
    }
    async remove(projectId, cityId, zoneId) {
        await this.svc.remove(+projectId, +cityId, +zoneId);
        return { message: 'Project location removed' };
    }
};
exports.ProjectLocationController = ProjectLocationController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all project locations' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProjectLocationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('zone/:zoneId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get project locations by zone' }),
    __param(0, (0, common_1.Param)('zoneId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectLocationController.prototype, "findByZone", null);
__decorate([
    (0, common_1.Get)(':projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get locations for a project' }),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectLocationController.prototype, "findByProject", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Add location to project' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ProjectLocationDto]),
    __metadata("design:returntype", Promise)
], ProjectLocationController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':projectId/city/:cityId/zone/:zoneId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove location from project' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('cityId')),
    __param(2, (0, common_1.Param)('zoneId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ProjectLocationController.prototype, "remove", null);
exports.ProjectLocationController = ProjectLocationController = __decorate([
    (0, swagger_1.ApiTags)('Projects - Locations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('project-locations'),
    __metadata("design:paramtypes", [project_location_service_1.ProjectLocationService])
], ProjectLocationController);
//# sourceMappingURL=project-location.controller.js.map