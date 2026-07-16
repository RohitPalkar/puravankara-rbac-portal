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
exports.RoleProjectPermissionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const role_project_permission_service_1 = require("./services/role-project-permission.service");
const require_permission_decorator_1 = require("./decorators/require-permission.decorator");
class CreateRoleProjectPermissionDto {
    roleId;
    projectId;
    moduleId;
    subModuleId;
    actionId;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateRoleProjectPermissionDto.prototype, "roleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateRoleProjectPermissionDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateRoleProjectPermissionDto.prototype, "moduleId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateRoleProjectPermissionDto.prototype, "subModuleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateRoleProjectPermissionDto.prototype, "actionId", void 0);
let RoleProjectPermissionController = class RoleProjectPermissionController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    findAll() {
        return this.svc.findAll();
    }
    findByRole(roleId) {
        return this.svc.findByRole(roleId);
    }
    findByRoleAndProject(roleId, projectId) {
        return this.svc.findByRoleAndProject(roleId, projectId);
    }
    create(dto) {
        return this.svc.create(dto);
    }
    remove(id) {
        return this.svc.remove(id);
    }
};
exports.RoleProjectPermissionController = RoleProjectPermissionController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all role-project permissions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RoleProjectPermissionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('role/:roleId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get permissions for a role' }),
    __param(0, (0, common_1.Param)('roleId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RoleProjectPermissionController.prototype, "findByRole", null);
__decorate([
    (0, common_1.Get)('role/:roleId/project/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get permissions for a role in a project' }),
    __param(0, (0, common_1.Param)('roleId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], RoleProjectPermissionController.prototype, "findByRoleAndProject", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a role-project permission' }),
    (0, require_permission_decorator_1.RequirePermission)({ module: 'PERMISSION', action: 'CREATE' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateRoleProjectPermissionDto]),
    __metadata("design:returntype", void 0)
], RoleProjectPermissionController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a role-project permission' }),
    (0, require_permission_decorator_1.RequirePermission)({ module: 'PERMISSION', action: 'DELETE' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RoleProjectPermissionController.prototype, "remove", null);
exports.RoleProjectPermissionController = RoleProjectPermissionController = __decorate([
    (0, swagger_1.ApiTags)('Permissions - Role Project'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('role-project-permissions'),
    __metadata("design:paramtypes", [role_project_permission_service_1.RoleProjectPermissionService])
], RoleProjectPermissionController);
//# sourceMappingURL=role-project-permission.controller.js.map