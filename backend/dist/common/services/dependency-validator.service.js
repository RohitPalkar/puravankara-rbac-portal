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
exports.DependencyValidatorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../modules/users/entities/user.entity");
const user_role_entity_1 = require("../../modules/users/entities/user-role.entity");
const role_project_permission_entity_1 = require("../../modules/permissions/entities/role-project-permission.entity");
const template_permission_entity_1 = require("../../modules/permissions/entities/template-permission.entity");
const module_action_entity_1 = require("../../modules/product-catalog/entities/module-action.entity");
const department_role_entity_1 = require("../../modules/organization/entities/department-role.entity");
let DependencyValidatorService = class DependencyValidatorService {
    userRepo;
    userRoleRepo;
    rppRepo;
    tpRepo;
    moduleActionRepo;
    deptRoleRepo;
    constructor(userRepo, userRoleRepo, rppRepo, tpRepo, moduleActionRepo, deptRoleRepo) {
        this.userRepo = userRepo;
        this.userRoleRepo = userRoleRepo;
        this.rppRepo = rppRepo;
        this.tpRepo = tpRepo;
        this.moduleActionRepo = moduleActionRepo;
        this.deptRoleRepo = deptRoleRepo;
    }
    async assertDepartmentDeletable(departmentId) {
        const userCount = await this.userRepo.count({
            where: { departmentId, deletedAt: null },
        });
        if (userCount > 0) {
            throw new common_1.ConflictException(`This department is assigned to ${userCount} user(s). Remove the assignments first.`);
        }
        const deptRoleCount = await this.deptRoleRepo.count({
            where: { departmentId },
        });
        if (deptRoleCount > 0) {
            throw new common_1.ConflictException(`This department has ${deptRoleCount} role mapping(s). Remove the mappings first.`);
        }
    }
    async assertRoleDeletable(roleId) {
        const userCount = await this.userRoleRepo.count({
            where: { roleId },
        });
        if (userCount > 0) {
            throw new common_1.ConflictException(`This role is assigned to ${userCount} user(s). Remove the assignments first.`);
        }
        const permCount = await this.rppRepo.count({
            where: { roleId },
        });
        if (permCount > 0) {
            throw new common_1.ConflictException(`This role has ${permCount} permission mapping(s). Remove the mappings first.`);
        }
    }
    async assertModuleDeletable(moduleId) {
        const rppCount = await this.rppRepo.count({
            where: { moduleId },
        });
        if (rppCount > 0) {
            throw new common_1.ConflictException(`This module has ${rppCount} role permission mapping(s). Remove the mappings first.`);
        }
        const tpCount = await this.tpRepo.count({
            where: { moduleId },
        });
        if (tpCount > 0) {
            throw new common_1.ConflictException(`This module has ${tpCount} template permission mapping(s). Remove the mappings first.`);
        }
        const maCount = await this.moduleActionRepo.count({
            where: { moduleId },
        });
        if (maCount > 0) {
            throw new common_1.ConflictException(`This module has ${maCount} module-action mapping(s). Remove the mappings first.`);
        }
    }
};
exports.DependencyValidatorService = DependencyValidatorService;
exports.DependencyValidatorService = DependencyValidatorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(user_role_entity_1.UserRole)),
    __param(2, (0, typeorm_1.InjectRepository)(role_project_permission_entity_1.RoleProjectPermission)),
    __param(3, (0, typeorm_1.InjectRepository)(template_permission_entity_1.TemplatePermission)),
    __param(4, (0, typeorm_1.InjectRepository)(module_action_entity_1.ModuleAction)),
    __param(5, (0, typeorm_1.InjectRepository)(department_role_entity_1.DepartmentRole)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DependencyValidatorService);
//# sourceMappingURL=dependency-validator.service.js.map