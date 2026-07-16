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
exports.UserProjectGroupService = exports.ProjectGroupProjectService = exports.ProjectGroupService = exports.UserProjectAccessService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_project_access_entity_1 = require("../entities/user-project-access.entity");
const project_group_entity_1 = require("../entities/project-group.entity");
const project_group_project_entity_1 = require("../entities/project-group-project.entity");
const user_project_group_entity_1 = require("../entities/user-project-group.entity");
const base_service_1 = require("../../../common/crud/base.service");
const permission_compiler_service_1 = require("../../permissions/services/permission-compiler.service");
const notification_service_1 = require("../../notifications/services/notification.service");
let UserProjectAccessService = class UserProjectAccessService {
    repository;
    compilerService;
    notifService;
    constructor(repository, compilerService, notifService) {
        this.repository = repository;
        this.compilerService = compilerService;
        this.notifService = notifService;
    }
    async findByUser(userId) {
        return this.repository.find({
            where: { userId },
            relations: { project: true },
        });
    }
    async assign(dto) {
        const existing = await this.repository.findOne({
            where: { userId: dto.userId, projectId: dto.projectId },
        });
        if (existing)
            throw new common_1.ConflictException('User already has access to this project');
        const access = this.repository.create({
            userId: dto.userId,
            projectId: dto.projectId,
            assignedBy: dto.assignedBy,
            assignedAt: new Date(),
        });
        const saved = await this.repository.save(access);
        this.notifService
            .sendToUser(dto.userId, 'Project Access Granted', `You have been granted access to project #${dto.projectId}`, 'PROJECT_ACCESS', String(dto.projectId), 'PROJECT', 'HIGH')
            .catch(() => { });
        this.compilerService.compileAndSave(dto.userId, dto.projectId).catch(() => { });
        return saved;
    }
    async assignBulk(dto) {
        const results = [];
        for (const projectId of dto.projectIds) {
            try {
                const access = await this.assign({
                    userId: dto.userId,
                    projectId,
                    assignedBy: dto.assignedBy,
                });
                results.push(access);
            }
            catch {
            }
        }
        return results;
    }
    async revoke(userId, projectId) {
        const result = await this.repository.delete({ userId, projectId });
        if (result.affected === 0)
            throw new common_1.NotFoundException('Project access not found');
        this.compilerService.compileAndSave(userId, projectId).catch(() => { });
    }
};
exports.UserProjectAccessService = UserProjectAccessService;
exports.UserProjectAccessService = UserProjectAccessService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_project_access_entity_1.UserProjectAccess)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        permission_compiler_service_1.PermissionCompilerService,
        notification_service_1.NotificationService])
], UserProjectAccessService);
let ProjectGroupService = class ProjectGroupService extends base_service_1.BaseService {
    repository;
    constructor(repository) {
        super(repository);
        this.repository = repository;
    }
};
exports.ProjectGroupService = ProjectGroupService;
exports.ProjectGroupService = ProjectGroupService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_group_entity_1.ProjectGroup)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProjectGroupService);
let ProjectGroupProjectService = class ProjectGroupProjectService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async findByGroup(groupId) {
        return this.repository.find({
            where: { groupId },
            relations: { project: true },
        });
    }
    async addProject(groupId, projectId) {
        const pgp = this.repository.create({ groupId, projectId });
        return this.repository.save(pgp);
    }
    async removeProject(groupId, projectId) {
        await this.repository.delete({ groupId, projectId });
    }
};
exports.ProjectGroupProjectService = ProjectGroupProjectService;
exports.ProjectGroupProjectService = ProjectGroupProjectService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_group_project_entity_1.ProjectGroupProject)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProjectGroupProjectService);
let UserProjectGroupService = class UserProjectGroupService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async findByUser(userId) {
        return this.repository.find({
            where: { userId },
            relations: { group: true },
        });
    }
    async assign(dto) {
        const upg = this.repository.create({
            userId: dto.userId,
            groupId: dto.groupId,
            assignedBy: dto.assignedBy,
            assignedAt: new Date(),
        });
        return this.repository.save(upg);
    }
    async revoke(userId, groupId) {
        await this.repository.delete({ userId, groupId });
    }
};
exports.UserProjectGroupService = UserProjectGroupService;
exports.UserProjectGroupService = UserProjectGroupService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_project_group_entity_1.UserProjectGroup)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserProjectGroupService);
//# sourceMappingURL=project-access.service.js.map