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
exports.UserPermissionOverrideController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const user_permission_override_service_1 = require("./services/user-permission-override.service");
const enums_1 = require("../../common/enums");
class CreateOverrideDto {
    userId;
    projectId;
    moduleId;
    subModuleId;
    actionId;
    permissionType;
    reason;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateOverrideDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateOverrideDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateOverrideDto.prototype, "moduleId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateOverrideDto.prototype, "subModuleId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateOverrideDto.prototype, "actionId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(enums_1.PermissionType),
    __metadata("design:type", String)
], CreateOverrideDto.prototype, "permissionType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOverrideDto.prototype, "reason", void 0);
let UserPermissionOverrideController = class UserPermissionOverrideController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    findByUser(userId) {
        return this.svc.findByUser(userId);
    }
    findByUserAndProject(userId, projectId) {
        return this.svc.findByUserAndProject(userId, projectId);
    }
    upsert(dto) {
        return this.svc.upsert(dto);
    }
    remove(id) {
        return this.svc.remove(id);
    }
};
exports.UserPermissionOverrideController = UserPermissionOverrideController;
__decorate([
    (0, common_1.Get)(':userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get permission overrides for a user' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserPermissionOverrideController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Get)(':userId/project/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get permission overrides for a user in a project' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], UserPermissionOverrideController.prototype, "findByUserAndProject", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create or update a permission override' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateOverrideDto]),
    __metadata("design:returntype", void 0)
], UserPermissionOverrideController.prototype, "upsert", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a permission override' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserPermissionOverrideController.prototype, "remove", null);
exports.UserPermissionOverrideController = UserPermissionOverrideController = __decorate([
    (0, swagger_1.ApiTags)('Permissions - User Overrides'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('user-permission-overrides'),
    __metadata("design:paramtypes", [user_permission_override_service_1.UserPermissionOverrideService])
], UserPermissionOverrideController);
//# sourceMappingURL=user-permission-override.controller.js.map