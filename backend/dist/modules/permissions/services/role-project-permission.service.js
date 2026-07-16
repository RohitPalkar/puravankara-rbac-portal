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
exports.RoleProjectPermissionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_project_permission_entity_1 = require("../entities/role-project-permission.entity");
const permission_compiler_service_1 = require("./permission-compiler.service");
let RoleProjectPermissionService = class RoleProjectPermissionService {
    repository;
    compilerService;
    constructor(repository, compilerService) {
        this.repository = repository;
        this.compilerService = compilerService;
    }
    async findAll() {
        return this.repository.find({ relations: { role: true, project: true, module: true, subModule: true, action: true } });
    }
    async findByRole(roleId) {
        return this.repository.find({
            where: { roleId },
            relations: { project: true, module: true, subModule: true, action: true },
        });
    }
    async findByRoleAndProject(roleId, projectId) {
        return this.repository.find({
            where: { roleId, projectId },
            relations: { module: true, subModule: true, action: true },
        });
    }
    async create(dto) {
        const existing = await this.repository.findOne({
            where: {
                roleId: dto.roleId,
                projectId: dto.projectId,
                moduleId: dto.moduleId,
                subModuleId: dto.subModuleId ?? null,
                actionId: dto.actionId,
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Permission already exists for this role/project/module/action');
        }
        const saved = await this.repository.save(this.repository.create(dto));
        await this.compilerService.compileForRole(dto.roleId).catch(() => { });
        return saved;
    }
    async remove(id) {
        const entity = await this.repository.findOne({ where: { id } });
        if (!entity)
            throw new common_1.NotFoundException('RoleProjectPermission not found');
        await this.repository.remove(entity);
        await this.compilerService.compileForRole(entity.roleId).catch(() => { });
    }
};
exports.RoleProjectPermissionService = RoleProjectPermissionService;
exports.RoleProjectPermissionService = RoleProjectPermissionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_project_permission_entity_1.RoleProjectPermission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        permission_compiler_service_1.PermissionCompilerService])
], RoleProjectPermissionService);
//# sourceMappingURL=role-project-permission.service.js.map