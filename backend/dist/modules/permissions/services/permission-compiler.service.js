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
var PermissionCompilerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionCompilerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const user_role_entity_1 = require("../../users/entities/user-role.entity");
const role_entity_1 = require("../../organization/entities/role.entity");
const role_project_permission_entity_1 = require("../entities/role-project-permission.entity");
const user_permission_template_entity_1 = require("../entities/user-permission-template.entity");
const template_permission_entity_1 = require("../entities/template-permission.entity");
const user_permission_override_entity_1 = require("../entities/user-permission-override.entity");
const user_project_access_entity_1 = require("../../project-access/entities/user-project-access.entity");
const user_project_group_entity_1 = require("../../project-access/entities/user-project-group.entity");
const project_group_project_entity_1 = require("../../project-access/entities/project-group-project.entity");
const user_project_feature_matrix_entity_1 = require("../entities/user-project-feature-matrix.entity");
const permission_snapshot_history_entity_1 = require("../entities/permission-snapshot-history.entity");
const module_entity_1 = require("../../product-catalog/entities/module.entity");
const sub_module_entity_1 = require("../../product-catalog/entities/sub-module.entity");
const action_entity_1 = require("../../product-catalog/entities/action.entity");
const permission_cache_service_1 = require("./permission-cache.service");
let PermissionCompilerService = PermissionCompilerService_1 = class PermissionCompilerService {
    userRepo;
    userRoleRepo;
    roleRepo;
    rppRepo;
    uptRepo;
    tpRepo;
    upoRepo;
    accessRepo;
    upgRepo;
    pgpRepo;
    matrixRepo;
    historyRepo;
    moduleRepo;
    subModuleRepo;
    actionRepo;
    cacheService;
    logger = new common_1.Logger(PermissionCompilerService_1.name);
    constructor(userRepo, userRoleRepo, roleRepo, rppRepo, uptRepo, tpRepo, upoRepo, accessRepo, upgRepo, pgpRepo, matrixRepo, historyRepo, moduleRepo, subModuleRepo, actionRepo, cacheService) {
        this.userRepo = userRepo;
        this.userRoleRepo = userRoleRepo;
        this.roleRepo = roleRepo;
        this.rppRepo = rppRepo;
        this.uptRepo = uptRepo;
        this.tpRepo = tpRepo;
        this.upoRepo = upoRepo;
        this.accessRepo = accessRepo;
        this.upgRepo = upgRepo;
        this.pgpRepo = pgpRepo;
        this.matrixRepo = matrixRepo;
        this.historyRepo = historyRepo;
        this.moduleRepo = moduleRepo;
        this.subModuleRepo = subModuleRepo;
        this.actionRepo = actionRepo;
        this.cacheService = cacheService;
    }
    async compileForUser(userId, projectId) {
        const user = await this.userRepo.findOne({ where: { empId: userId } });
        if (!user || !user.isActive || user.deletedAt) {
            return [];
        }
        const isSuperAdmin = await this.isSuperAdmin(userId);
        const modules = await this.moduleRepo.find({ where: { isActive: true } });
        const result = [];
        for (const mod of modules) {
            const subModules = await this.subModuleRepo.find({
                where: { moduleId: mod.id, isActive: true },
            });
            const allowedActions = isSuperAdmin
                ? await this.actionRepo.find({ where: { isActive: true } })
                : await this.resolveModuleActions(userId, projectId, mod.id);
            const allowedActionCodes = new Set(allowedActions.map((a) => a.code));
            const featureSubModules = [];
            if (isSuperAdmin) {
                if (subModules.length > 0) {
                    for (const sm of subModules) {
                        featureSubModules.push({
                            id: sm.id,
                            name: sm.name,
                            actions: [...allowedActionCodes],
                        });
                    }
                }
                else {
                    featureSubModules.push({
                        id: 0,
                        name: mod.name,
                        actions: [...allowedActionCodes],
                    });
                }
            }
            else {
                const hasModuleAccess = await this.hasModuleAccess(userId, projectId, mod.id);
                if (!hasModuleAccess)
                    continue;
                for (const sm of subModules) {
                    const smActions = await this.resolveSubModuleActions(userId, projectId, mod.id, sm.id);
                    if (smActions.length > 0) {
                        featureSubModules.push({
                            id: sm.id,
                            name: sm.name,
                            actions: smActions,
                        });
                    }
                }
                if (subModules.length === 0) {
                    const actions = await this.resolveModuleActions(userId, projectId, mod.id);
                    if (actions.length > 0) {
                        featureSubModules.push({
                            id: 0,
                            name: mod.name,
                            actions: actions.map((a) => a.code),
                        });
                    }
                }
            }
            if (featureSubModules.length > 0) {
                result.push({
                    id: mod.id,
                    name: mod.name,
                    subModules: featureSubModules,
                });
            }
        }
        return result;
    }
    async compileAndSave(userId, projectId, changedBy) {
        const document = await this.compileForUser(userId, projectId);
        let matrix = await this.matrixRepo.findOne({
            where: { userId, projectId },
        });
        if (matrix?.featurePrivilegesDocument) {
            await this.historyRepo.save(this.historyRepo.create({
                userId,
                projectId,
                snapshot: matrix.featurePrivilegesDocument,
                changedBy: changedBy ?? 'SYSTEM',
            }));
        }
        if (matrix) {
            matrix.featurePrivilegesDocument = { modules: document };
            matrix.version += 1;
            await this.matrixRepo.save(matrix);
        }
        else {
            matrix = this.matrixRepo.create({
                userId,
                projectId,
                featurePrivilegesDocument: { modules: document },
                version: 1,
            });
            await this.matrixRepo.save(matrix);
        }
        const cacheKey = `permissions:snapshot:${userId}:${projectId}`;
        await this.cacheService.set(cacheKey, { modules: document }, 3600);
    }
    async compileForRole(roleId) {
        const userRoles = await this.userRoleRepo.find({ where: { roleId } });
        for (const ur of userRoles) {
            await this.compileForAllUserProjects(ur.userId);
        }
    }
    async compileForUsersByProject(projectId) {
        const accessRows = await this.accessRepo.find({ where: { projectId } });
        for (const row of accessRows) {
            await this.compileAndSave(row.userId, projectId);
        }
    }
    async getCompiled(userId, projectId) {
        const cacheKey = `permissions:snapshot:${userId}:${projectId}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached)
            return cached;
        const matrix = await this.matrixRepo.findOne({
            where: { userId, projectId },
        });
        if (matrix?.featurePrivilegesDocument) {
            const doc = matrix.featurePrivilegesDocument;
            await this.cacheService.set(cacheKey, doc, 3600);
            return doc;
        }
        return { modules: [] };
    }
    async compileForAllUserProjects(userId) {
        const isSuperAdmin = await this.isSuperAdmin(userId);
        let projectIds;
        if (isSuperAdmin) {
            const projects = await this.accessRepo
                .createQueryBuilder('upa')
                .select('upa.project_id')
                .distinct(true)
                .getRawMany();
            projectIds = projects.map((p) => Number(p.project_id));
        }
        else {
            const directIds = (await this.accessRepo.find({ where: { userId } })).map((a) => a.projectId);
            const groups = await this.upgRepo.find({ where: { userId } });
            const groupIds = groups.map((g) => g.groupId);
            if (groupIds.length > 0) {
                const groupProjectIds = (await this.pgpRepo.find({ where: { groupId: (0, typeorm_2.In)(groupIds) } })).map((p) => p.projectId);
                projectIds = [...new Set([...directIds, ...groupProjectIds])];
            }
            else {
                projectIds = directIds;
            }
        }
        for (const pid of projectIds) {
            await this.compileAndSave(userId, pid);
        }
    }
    async invalidateSnapshot(userId, projectId) {
        const cacheKey = `permissions:snapshot:${userId}:${projectId}`;
        await this.cacheService.invalidate(cacheKey);
    }
    async isSuperAdmin(userId) {
        const roles = await this.userRoleRepo.find({
            where: { userId },
            relations: { role: true },
        });
        return roles.some((ur) => ur.role.name === 'SUPER_ADMIN');
    }
    async hasModuleAccess(userId, projectId, moduleId) {
        const rolePerms = await this.rppRepo.findOne({
            where: { roleId: (0, typeorm_2.In)((await this.userRoleRepo.find({ where: { userId } })).map((ur) => ur.roleId)), projectId, moduleId },
        });
        if (rolePerms)
            return true;
        const templates = await this.uptRepo.find({ where: { userId, projectId } });
        if (templates.length > 0) {
            const templateIds = templates.map((t) => t.templateId);
            const tp = await this.tpRepo.findOne({
                where: { templateId: (0, typeorm_2.In)(templateIds), moduleId },
            });
            if (tp)
                return true;
        }
        return false;
    }
    async resolveModuleActions(userId, projectId, moduleId) {
        const userRoles = await this.userRoleRepo.find({ where: { userId } });
        const roleIds = userRoles.map((ur) => ur.roleId);
        const actionIds = new Set();
        if (roleIds.length > 0) {
            const rolePerms = await this.rppRepo.find({
                where: { roleId: (0, typeorm_2.In)(roleIds), projectId, moduleId },
            });
            for (const rp of rolePerms)
                actionIds.add(rp.actionId);
        }
        const templates = await this.uptRepo.find({ where: { userId, projectId } });
        if (templates.length > 0) {
            const templateIds = templates.map((t) => t.templateId);
            const tpPerms = await this.tpRepo.find({
                where: { templateId: (0, typeorm_2.In)(templateIds), moduleId },
            });
            for (const tp of tpPerms)
                actionIds.add(tp.actionId);
        }
        const overrides = await this.upoRepo.find({
            where: { userId, projectId, moduleId },
        });
        for (const o of overrides) {
            if (o.permissionType === 'DENY')
                actionIds.delete(o.actionId);
            if (o.permissionType === 'ALLOW')
                actionIds.add(o.actionId);
        }
        if (actionIds.size === 0)
            return [];
        return this.actionRepo.find({
            where: { id: (0, typeorm_2.In)([...actionIds]), isActive: true },
        });
    }
    async resolveSubModuleActions(userId, projectId, moduleId, subModuleId) {
        const userRoles = await this.userRoleRepo.find({ where: { userId } });
        const roleIds = userRoles.map((ur) => ur.roleId);
        const actionIds = new Set();
        if (roleIds.length > 0) {
            const rolePerms = await this.rppRepo.find({
                where: {
                    roleId: (0, typeorm_2.In)(roleIds),
                    projectId,
                    moduleId,
                    subModuleId,
                },
            });
            for (const rp of rolePerms)
                actionIds.add(rp.actionId);
        }
        const templates = await this.uptRepo.find({ where: { userId, projectId } });
        if (templates.length > 0) {
            const templateIds = templates.map((t) => t.templateId);
            const tpPerms = await this.tpRepo.find({
                where: { templateId: (0, typeorm_2.In)(templateIds), moduleId, subModuleId },
            });
            for (const tp of tpPerms)
                actionIds.add(tp.actionId);
        }
        const overrides = await this.upoRepo.find({
            where: { userId, projectId, moduleId, subModuleId },
        });
        for (const o of overrides) {
            if (o.permissionType === 'DENY')
                actionIds.delete(o.actionId);
            if (o.permissionType === 'ALLOW')
                actionIds.add(o.actionId);
        }
        if (actionIds.size === 0)
            return [];
        const actions = await this.actionRepo.find({
            where: { id: (0, typeorm_2.In)([...actionIds]), isActive: true },
        });
        return actions.map((a) => a.code);
    }
};
exports.PermissionCompilerService = PermissionCompilerService;
exports.PermissionCompilerService = PermissionCompilerService = PermissionCompilerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(user_role_entity_1.UserRole)),
    __param(2, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(3, (0, typeorm_1.InjectRepository)(role_project_permission_entity_1.RoleProjectPermission)),
    __param(4, (0, typeorm_1.InjectRepository)(user_permission_template_entity_1.UserPermissionTemplate)),
    __param(5, (0, typeorm_1.InjectRepository)(template_permission_entity_1.TemplatePermission)),
    __param(6, (0, typeorm_1.InjectRepository)(user_permission_override_entity_1.UserPermissionOverride)),
    __param(7, (0, typeorm_1.InjectRepository)(user_project_access_entity_1.UserProjectAccess)),
    __param(8, (0, typeorm_1.InjectRepository)(user_project_group_entity_1.UserProjectGroup)),
    __param(9, (0, typeorm_1.InjectRepository)(project_group_project_entity_1.ProjectGroupProject)),
    __param(10, (0, typeorm_1.InjectRepository)(user_project_feature_matrix_entity_1.UserProjectFeatureMatrix)),
    __param(11, (0, typeorm_1.InjectRepository)(permission_snapshot_history_entity_1.PermissionSnapshotHistory)),
    __param(12, (0, typeorm_1.InjectRepository)(module_entity_1.Module)),
    __param(13, (0, typeorm_1.InjectRepository)(sub_module_entity_1.SubModule)),
    __param(14, (0, typeorm_1.InjectRepository)(action_entity_1.Action)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        permission_cache_service_1.PermissionCacheService])
], PermissionCompilerService);
//# sourceMappingURL=permission-compiler.service.js.map