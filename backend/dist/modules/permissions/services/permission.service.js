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
var PermissionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionService = void 0;
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
const module_entity_1 = require("../../product-catalog/entities/module.entity");
const sub_module_entity_1 = require("../../product-catalog/entities/sub-module.entity");
const action_entity_1 = require("../../product-catalog/entities/action.entity");
const permission_cache_service_1 = require("./permission-cache.service");
const permission_compiler_service_1 = require("./permission-compiler.service");
let PermissionService = PermissionService_1 = class PermissionService {
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
    moduleRepo;
    subModuleRepo;
    actionRepo;
    cacheService;
    compilerService;
    logger = new common_1.Logger(PermissionService_1.name);
    constructor(userRepo, userRoleRepo, roleRepo, rppRepo, uptRepo, tpRepo, upoRepo, accessRepo, upgRepo, pgpRepo, moduleRepo, subModuleRepo, actionRepo, cacheService, compilerService) {
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
        this.moduleRepo = moduleRepo;
        this.subModuleRepo = subModuleRepo;
        this.actionRepo = actionRepo;
        this.cacheService = cacheService;
        this.compilerService = compilerService;
    }
    async resolve(context) {
        const { userId, projectId, moduleCode, actionCode } = context;
        if (!userId || !moduleCode || !actionCode) {
            return {
                allowed: false,
                source: 'denied',
                reason: 'Missing required context',
            };
        }
        const user = await this.userRepo.findOne({ where: { empId: userId } });
        if (!user || !user.isActive || user.deletedAt) {
            return {
                allowed: false,
                source: 'denied',
                reason: 'User inactive or deleted',
            };
        }
        const isSuperAdmin = await this.isSuperAdmin(userId);
        if (isSuperAdmin) {
            return { allowed: true, source: 'super-admin' };
        }
        if (!projectId) {
            return {
                allowed: false,
                source: 'denied',
                reason: 'Project ID is required',
            };
        }
        const hasProjectAccess = await this.hasProjectAccess(userId, projectId);
        if (!hasProjectAccess) {
            return { allowed: false, source: 'denied', reason: 'No project access' };
        }
        const module = await this.moduleRepo.findOne({
            where: { name: moduleCode, isActive: true },
        });
        const action = await this.actionRepo.findOne({
            where: { code: actionCode, isActive: true },
        });
        if (!module || !action) {
            return {
                allowed: false,
                source: 'denied',
                reason: 'Module or action not found',
            };
        }
        const override = await this.upoRepo.findOne({
            where: {
                userId,
                projectId,
                moduleId: module.id,
                actionId: action.id,
            },
        });
        if (override && override.permissionType === 'DENY') {
            return {
                allowed: false,
                source: 'override',
                reason: 'Explicitly denied by override',
            };
        }
        if (override && override.permissionType === 'ALLOW') {
            return { allowed: true, source: 'override' };
        }
        const hasRolePermission = await this.hasRolePermission(userId, projectId, module.id, action.id);
        if (hasRolePermission) {
            return { allowed: true, source: 'role' };
        }
        const hasTemplatePermission = await this.hasTemplatePermission(userId, projectId, module.id, action.id);
        if (hasTemplatePermission) {
            return { allowed: true, source: 'template' };
        }
        return {
            allowed: false,
            source: 'denied',
            reason: 'No matching permission',
        };
    }
    async explain(context) {
        const { userId, projectId, moduleCode, actionCode } = context;
        const explanation = [];
        const user = await this.userRepo.findOne({ where: { empId: userId } });
        if (!user || !user.isActive || user.deletedAt) {
            explanation.push({
                step: 'USER_VALIDATION',
                result: false,
                message: 'User inactive or deleted',
            });
            return { allowed: false, source: 'denied', explanation };
        }
        explanation.push({
            step: 'USER_VALIDATION',
            result: true,
            message: `User ${userId} is active`,
        });
        const isSuperAdmin = await this.isSuperAdmin(userId);
        if (isSuperAdmin) {
            explanation.push({
                step: 'SUPER_ADMIN',
                result: true,
                message: 'User has Super Admin role — full access granted',
            });
            return { allowed: true, source: 'super-admin', explanation };
        }
        explanation.push({
            step: 'SUPER_ADMIN',
            result: false,
            message: 'User is not Super Admin',
        });
        const hasProjectAccess = await this.hasProjectAccess(userId, projectId);
        if (!hasProjectAccess) {
            explanation.push({
                step: 'PROJECT_ACCESS',
                result: false,
                message: `User does not have access to project ${projectId}`,
            });
            return { allowed: false, source: 'denied', explanation };
        }
        explanation.push({
            step: 'PROJECT_ACCESS',
            result: true,
            message: `User has access to project ${projectId}`,
        });
        const module = await this.moduleRepo.findOne({
            where: { name: moduleCode, isActive: true },
        });
        const action = await this.actionRepo.findOne({
            where: { code: actionCode, isActive: true },
        });
        if (!module || !action) {
            explanation.push({
                step: 'MODULE_ACTION',
                result: false,
                message: `Module ${moduleCode} or action ${actionCode} not found`,
            });
            return { allowed: false, source: 'denied', explanation };
        }
        explanation.push({
            step: 'MODULE_ACTION',
            result: true,
            message: `Module ${moduleCode} and action ${actionCode} exist`,
        });
        const override = await this.upoRepo.findOne({
            where: { userId, projectId, moduleId: module.id, actionId: action.id },
        });
        if (override && override.permissionType === 'DENY') {
            explanation.push({
                step: 'USER_OVERRIDE',
                result: false,
                message: `User has explicit DENY override on ${moduleCode}:${actionCode}`,
            });
            return { allowed: false, source: 'override', explanation };
        }
        if (override && override.permissionType === 'ALLOW') {
            explanation.push({
                step: 'USER_OVERRIDE',
                result: true,
                message: `User has explicit ALLOW override on ${moduleCode}:${actionCode}`,
            });
            return { allowed: true, source: 'override', explanation };
        }
        const hasRolePermission = await this.hasRolePermission(userId, projectId, module.id, action.id);
        if (hasRolePermission) {
            const userRoles = await this.userRoleRepo.find({
                where: { userId },
                relations: { role: true },
            });
            const roleNames = userRoles.map((ur) => ur.role.name).join(', ');
            explanation.push({
                step: 'ROLE_PERMISSION',
                result: true,
                message: `Allowed through role(s): ${roleNames}`,
            });
            return { allowed: true, source: 'role', explanation };
        }
        explanation.push({
            step: 'ROLE_PERMISSION',
            result: false,
            message: 'No role-based permission found',
        });
        const hasTemplatePermission = await this.hasTemplatePermission(userId, projectId, module.id, action.id);
        if (hasTemplatePermission) {
            explanation.push({
                step: 'TEMPLATE_PERMISSION',
                result: true,
                message: 'Allowed through permission template',
            });
            return { allowed: true, source: 'template', explanation };
        }
        explanation.push({
            step: 'TEMPLATE_PERMISSION',
            result: false,
            message: 'No template-based permission found',
        });
        explanation.push({
            step: 'DEFAULT_DENY',
            result: false,
            message: 'No matching permission found — default DENY',
        });
        return { allowed: false, source: 'denied', explanation };
    }
    async getUserPermissions(userId) {
        const user = await this.userRepo.findOne({ where: { empId: userId } });
        if (!user || !user.isActive || user.deletedAt) {
            return { user: { empId: userId, name: '', email: '', roles: [] }, projects: [] };
        }
        const isSuperAdmin = await this.isSuperAdmin(userId);
        const userRoles = await this.userRoleRepo.find({
            where: { userId },
            relations: { role: true },
        });
        const roleNames = userRoles.map((ur) => ur.role.name);
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
            projectIds = await this.getUserProjectIds(userId);
        }
        if (projectIds.length === 0) {
            return {
                user: { empId: user.empId, name: user.name, email: user.email, roles: roleNames },
                projects: [],
            };
        }
        let projectEntities;
        if (isSuperAdmin) {
            const rows = await this.accessRepo
                .createQueryBuilder('upa')
                .leftJoin('upa.project', 'project')
                .select(['project.id', 'project.name'])
                .distinct(true)
                .getRawMany();
            projectEntities = rows.map((r) => ({
                id: Number(r.project_id),
                name: r.project_name,
            }));
        }
        else {
            const accessRows = await this.accessRepo.find({
                where: { userId },
                relations: { project: true },
            });
            projectEntities = accessRows.map((a) => ({
                id: a.projectId,
                name: a.project.name,
            }));
        }
        const result = {
            user: { empId: user.empId, name: user.name, email: user.email, roles: roleNames },
            projects: [],
        };
        for (const proj of projectEntities) {
            const modules = await this.getUserModulePermissionsNested(userId, proj.id, isSuperAdmin);
            result.projects.push({ id: proj.id, name: proj.name, modules });
        }
        return result;
    }
    async canAccess(context) {
        const result = await this.resolve(context);
        return result.allowed;
    }
    async assertOrThrow(context) {
        const result = await this.resolve(context);
        if (!result.allowed) {
            this.logger.warn(`Permission denied: user=${context.userId} project=${context.projectId} module=${context.moduleCode} action=${context.actionCode} reason=${result.reason}`);
            throw new common_1.ForbiddenException('Insufficient permissions');
        }
    }
    async isSuperAdmin(userId) {
        const roles = await this.userRoleRepo.find({
            where: { userId },
            relations: { role: true },
        });
        return roles.some((ur) => ur.role.name === 'SUPER_ADMIN');
    }
    async hasProjectAccess(userId, projectId) {
        const directAccess = await this.accessRepo.findOne({
            where: { userId, projectId },
        });
        if (directAccess)
            return true;
        const groups = await this.upgRepo.find({
            where: { userId },
            relations: { group: true },
        });
        const groupIds = groups.map((g) => g.groupId);
        if (groupIds.length === 0)
            return false;
        const groupProjects = await this.pgpRepo.find({
            where: { groupId: (0, typeorm_2.In)(groupIds), projectId },
        });
        return groupProjects.length > 0;
    }
    async getUserProjectIds(userId) {
        const directIds = (await this.accessRepo.find({ where: { userId } })).map((a) => a.projectId);
        const groups = await this.upgRepo.find({ where: { userId } });
        const groupIds = groups.map((g) => g.groupId);
        if (groupIds.length > 0) {
            const groupProjectIds = (await this.pgpRepo.find({ where: { groupId: (0, typeorm_2.In)(groupIds) } })).map((p) => p.projectId);
            return [...new Set([...directIds, ...groupProjectIds])];
        }
        return directIds;
    }
    async hasRolePermission(userId, projectId, moduleId, actionId) {
        const userRoles = await this.userRoleRepo.find({ where: { userId } });
        if (userRoles.length === 0)
            return false;
        const roleIds = userRoles.map((ur) => ur.roleId);
        const count = await this.rppRepo.count({
            where: {
                roleId: (0, typeorm_2.In)(roleIds),
                projectId,
                moduleId,
                actionId,
            },
        });
        return count > 0;
    }
    async hasTemplatePermission(userId, projectId, moduleId, actionId) {
        const templates = await this.uptRepo.find({ where: { userId, projectId } });
        if (templates.length === 0)
            return false;
        const templateIds = templates.map((t) => t.templateId);
        const count = await this.tpRepo.count({
            where: {
                templateId: (0, typeorm_2.In)(templateIds),
                moduleId,
                actionId,
            },
        });
        return count > 0;
    }
    async getUserModulePermissionsNested(userId, projectId, isSuperAdmin) {
        const modules = await this.moduleRepo.find({ where: { isActive: true } });
        const allSubModules = await this.subModuleRepo.find({ where: { isActive: true } });
        const allActions = await this.actionRepo.find({ where: { isActive: true } });
        const result = [];
        for (const mod of modules) {
            const subModules = allSubModules.filter((sm) => sm.moduleId === mod.id);
            const subModuleEntries = [];
            if (isSuperAdmin) {
                if (subModules.length > 0) {
                    for (const sm of subModules) {
                        subModuleEntries.push({
                            id: sm.id,
                            name: sm.name,
                            actions: allActions.map((a) => ({
                                code: a.code,
                                label: a.label,
                                allowed: true,
                            })),
                        });
                    }
                }
                else {
                    subModuleEntries.push({
                        id: 0,
                        name: mod.name,
                        actions: allActions.map((a) => ({
                            code: a.code,
                            label: a.label,
                            allowed: true,
                        })),
                    });
                }
            }
            else {
                const userRoles = await this.userRoleRepo.find({ where: { userId } });
                const roleIds = userRoles.map((ur) => ur.roleId);
                const rolePerms = roleIds.length > 0
                    ? await this.rppRepo.find({
                        where: { roleId: (0, typeorm_2.In)(roleIds), projectId, moduleId: mod.id },
                    })
                    : [];
                const templates = await this.uptRepo.find({
                    where: { userId, projectId },
                });
                const templateIds = templates.map((t) => t.templateId);
                const templatePerms = templateIds.length > 0
                    ? await this.tpRepo.find({
                        where: { templateId: (0, typeorm_2.In)(templateIds), moduleId: mod.id },
                    })
                    : [];
                const overrides = await this.upoRepo.find({
                    where: { userId, projectId, moduleId: mod.id },
                });
                if (subModules.length > 0) {
                    for (const sm of subModules) {
                        const smRolePerms = rolePerms.filter((p) => p.subModuleId === sm.id);
                        const smTemplatePerms = templatePerms.filter((p) => p.subModuleId === sm.id);
                        const smOverrides = overrides.filter((o) => o.subModuleId === sm.id);
                        const grantedActionIds = new Set();
                        for (const p of smRolePerms)
                            grantedActionIds.add(p.actionId);
                        for (const p of smTemplatePerms)
                            grantedActionIds.add(p.actionId);
                        for (const o of smOverrides) {
                            if (o.permissionType === 'DENY')
                                grantedActionIds.delete(o.actionId);
                            if (o.permissionType === 'ALLOW')
                                grantedActionIds.add(o.actionId);
                        }
                        const actions = allActions
                            .filter((a) => grantedActionIds.has(a.id))
                            .map((a) => ({ code: a.code, label: a.label, allowed: true }));
                        if (actions.length > 0) {
                            subModuleEntries.push({ id: sm.id, name: sm.name, actions });
                        }
                    }
                }
                else {
                    const grantedActionIds = new Set();
                    for (const p of rolePerms)
                        grantedActionIds.add(p.actionId);
                    for (const p of templatePerms)
                        grantedActionIds.add(p.actionId);
                    for (const o of overrides) {
                        if (o.permissionType === 'DENY')
                            grantedActionIds.delete(o.actionId);
                        if (o.permissionType === 'ALLOW')
                            grantedActionIds.add(o.actionId);
                    }
                    if (grantedActionIds.size > 0) {
                        const actions = allActions
                            .filter((a) => grantedActionIds.has(a.id))
                            .map((a) => ({ code: a.code, label: a.label, allowed: true }));
                        if (actions.length > 0) {
                            subModuleEntries.push({ id: 0, name: mod.name, actions });
                        }
                    }
                }
            }
            if (subModuleEntries.length > 0) {
                result.push({ id: mod.id, name: mod.name, subModules: subModuleEntries });
            }
        }
        return result;
    }
};
exports.PermissionService = PermissionService;
exports.PermissionService = PermissionService = PermissionService_1 = __decorate([
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
    __param(10, (0, typeorm_1.InjectRepository)(module_entity_1.Module)),
    __param(11, (0, typeorm_1.InjectRepository)(sub_module_entity_1.SubModule)),
    __param(12, (0, typeorm_1.InjectRepository)(action_entity_1.Action)),
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
        permission_cache_service_1.PermissionCacheService,
        permission_compiler_service_1.PermissionCompilerService])
], PermissionService);
//# sourceMappingURL=permission.service.js.map