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
exports.UserPermissionOverrideService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_permission_override_entity_1 = require("../entities/user-permission-override.entity");
const permission_compiler_service_1 = require("./permission-compiler.service");
let UserPermissionOverrideService = class UserPermissionOverrideService {
    repository;
    compilerService;
    constructor(repository, compilerService) {
        this.repository = repository;
        this.compilerService = compilerService;
    }
    async findByUser(userId) {
        return this.repository.find({
            where: { userId },
            relations: { module: true, subModule: true, action: true },
        });
    }
    async findByUserAndProject(userId, projectId) {
        return this.repository.find({
            where: { userId, projectId },
            relations: { module: true, subModule: true, action: true },
        });
    }
    async upsert(dto) {
        const existing = await this.repository.findOne({
            where: {
                userId: dto.userId,
                projectId: dto.projectId,
                moduleId: dto.moduleId,
                subModuleId: dto.subModuleId ?? (0, typeorm_2.IsNull)(),
                actionId: dto.actionId,
            },
        });
        if (existing) {
            existing.permissionType = dto.permissionType;
            existing.reason = dto.reason;
            const saved = await this.repository.save(existing);
            await this.compilerService.compileAndSave(dto.userId, dto.projectId).catch(() => { });
            return saved;
        }
        const override = this.repository.create(dto);
        const saved = await this.repository.save(override);
        await this.compilerService.compileAndSave(dto.userId, dto.projectId).catch(() => { });
        return saved;
    }
    async remove(id) {
        const entity = await this.repository.findOne({ where: { id } });
        if (!entity)
            throw new common_1.NotFoundException('Override not found');
        const { userId, projectId } = entity;
        await this.repository.delete(id);
        await this.compilerService.compileAndSave(userId, projectId).catch(() => { });
    }
    async removeByKey(userId, projectId, moduleId, actionId) {
        const result = await this.repository.delete({
            userId,
            projectId,
            moduleId,
            actionId,
        });
        if (result.affected === 0)
            throw new common_1.NotFoundException('Override not found');
    }
};
exports.UserPermissionOverrideService = UserPermissionOverrideService;
exports.UserPermissionOverrideService = UserPermissionOverrideService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_permission_override_entity_1.UserPermissionOverride)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        permission_compiler_service_1.PermissionCompilerService])
], UserPermissionOverrideService);
//# sourceMappingURL=user-permission-override.service.js.map