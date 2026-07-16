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
exports.DepartmentRoleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const department_role_service_1 = require("../services/department-role.service");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
class DepartmentRoleDto {
    departmentId;
    roleId;
}
__decorate([
    (0, swagger_2.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], DepartmentRoleDto.prototype, "departmentId", void 0);
__decorate([
    (0, swagger_2.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], DepartmentRoleDto.prototype, "roleId", void 0);
let DepartmentRoleController = class DepartmentRoleController {
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
    async remove(departmentId, roleId) {
        await this.svc.remove(+departmentId, +roleId);
        return { message: 'Mapping deleted' };
    }
};
exports.DepartmentRoleController = DepartmentRoleController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all department-role mappings' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DepartmentRoleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create department-role mapping' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DepartmentRoleDto]),
    __metadata("design:returntype", Promise)
], DepartmentRoleController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':departmentId/role/:roleId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete department-role mapping' }),
    __param(0, (0, common_1.Param)('departmentId')),
    __param(1, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DepartmentRoleController.prototype, "remove", null);
exports.DepartmentRoleController = DepartmentRoleController = __decorate([
    (0, swagger_1.ApiTags)('Organization - Department Roles'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('department-roles'),
    __metadata("design:paramtypes", [department_role_service_1.DepartmentRoleService])
], DepartmentRoleController);
//# sourceMappingURL=department-role.controller.js.map