import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull, DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/entities/user-role.entity';
import { Role } from '../../organization/entities/role.entity';
import { RoleProjectPermission } from '../entities/role-project-permission.entity';
import { UserPermissionTemplate } from '../entities/user-permission-template.entity';
import { TemplatePermission } from '../entities/template-permission.entity';
import { UserPermissionOverride } from '../entities/user-permission-override.entity';
import { UserProjectAccess } from '../../project-access/entities/user-project-access.entity';
import { UserProjectGroup } from '../../project-access/entities/user-project-group.entity';
import { ProjectGroupProject } from '../../project-access/entities/project-group-project.entity';
import { Module } from '../../product-catalog/entities/module.entity';
import { SubModule } from '../../product-catalog/entities/sub-module.entity';
import { ModuleAction } from '../../product-catalog/entities/module-action.entity';
import { Action } from '../../product-catalog/entities/action.entity';
import { PermissionCacheService } from './permission-cache.service';
import { PermissionCompilerService } from './permission-compiler.service';
import { ScopeResolutionService } from './scope-resolution.service';
import { PermissionContext } from '../interfaces/permission-context.interface';
import { ResolvedPermission } from '../interfaces/resolved-permission.interface';
import { UserPermissionsResponse } from '../dto/user-permissions.dto';
import {
  ExplainPermissionResponse,
  ExplainStep,
} from '../dto/explain-permission.dto';
import { PermissionProfile } from '../entities/permission-profile.entity';
import { RoleActionPermission } from '../entities/role-action-permission.entity';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(RoleProjectPermission)
    private readonly rppRepo: Repository<RoleProjectPermission>,
    @InjectRepository(UserPermissionTemplate)
    private readonly uptRepo: Repository<UserPermissionTemplate>,
    @InjectRepository(TemplatePermission)
    private readonly tpRepo: Repository<TemplatePermission>,
    @InjectRepository(UserPermissionOverride)
    private readonly upoRepo: Repository<UserPermissionOverride>,
    @InjectRepository(UserProjectAccess)
    private readonly accessRepo: Repository<UserProjectAccess>,
    @InjectRepository(UserProjectGroup)
    private readonly upgRepo: Repository<UserProjectGroup>,
    @InjectRepository(ProjectGroupProject)
    private readonly pgpRepo: Repository<ProjectGroupProject>,
    @InjectRepository(Module)
    private readonly moduleRepo: Repository<Module>,
    @InjectRepository(SubModule)
    private readonly subModuleRepo: Repository<SubModule>,
    @InjectRepository(ModuleAction)
    private readonly moduleActionRepo: Repository<ModuleAction>,
    @InjectRepository(Action)
    private readonly actionRepo: Repository<Action>,
    @InjectRepository(PermissionProfile)
    private readonly profileRepo: Repository<PermissionProfile>,
    @InjectRepository(RoleActionPermission)
    private readonly rapRepo: Repository<RoleActionPermission>,
    private readonly dataSource: DataSource,
    private readonly cacheService: PermissionCacheService,
    private readonly compilerService: PermissionCompilerService,
    private readonly scopeService: ScopeResolutionService,
  ) {}

  async resolve(context: PermissionContext): Promise<ResolvedPermission> {
    const { userId, projectId, moduleCode, actionCode, activeRoleId } = context as PermissionContext & { activeRoleId?: number | null };

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

    if (projectId) {
      const scope = activeRoleId
        ? await this.scopeService.resolveUserScopeForRole(userId, activeRoleId).catch(() => this.scopeService.resolveUserScope(userId))
        : await this.scopeService.resolveUserScope(userId);
      if (scope.resources.zones.length > 0 && !scope.hasProject(projectId)) {
        return {
          allowed: false,
          source: 'denied',
          reason: 'Project is outside user zone scope',
        };
      }
    }

    if (!projectId) {
      return {
        allowed: false,
        source: 'denied',
        reason: 'Project ID is required',
      };
    }

    const hasProjectAccess = activeRoleId
      ? await this.hasProjectAccessForRole(userId, projectId, activeRoleId)
      : await this.hasProjectAccess(userId, projectId);
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

    const hasRolePermission = await this.hasRolePermission(
      userId,
      projectId,
      module.id,
      action.id,
      activeRoleId,
    );
    if (hasRolePermission) {
      return { allowed: true, source: 'role' };
    }

    const hasTemplatePermission = await this.hasTemplatePermission(
      userId,
      projectId,
      module.id,
      action.id,
    );
    if (hasTemplatePermission) {
      return { allowed: true, source: 'template' };
    }

    const hasProfilePermission = await this.hasProfilePermission(
      userId,
      projectId,
      module.id,
      action.id,
      activeRoleId,
    );
    if (hasProfilePermission) {
      return { allowed: true, source: 'profile' };
    }

    return {
      allowed: false,
      source: 'denied',
      reason: 'No matching permission',
    };
  }

  async explain(
    context: PermissionContext,
  ): Promise<ExplainPermissionResponse> {
    const { userId, projectId, moduleCode, actionCode, activeRoleId } = context as PermissionContext & { activeRoleId?: number | null };
    const explanation: ExplainStep[] = [];

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

    // Scope check: is project within user's zone scope?
    if (projectId) {
      try {
        const scope = activeRoleId
          ? await this.scopeService.resolveUserScopeForRole(userId, activeRoleId).catch(() => this.scopeService.resolveUserScope(userId))
          : await this.scopeService.resolveUserScope(userId);
        if (scope.resources.zones.length > 0 && !scope.hasProject(projectId)) {
          explanation.push({
            step: 'ZONE_SCOPE',
            result: false,
            message: `Project ${projectId} is outside user's zone scope`,
          });
          return { allowed: false, source: 'denied', explanation };
        }
        explanation.push({
          step: 'ZONE_SCOPE',
          result: true,
          message: `Project ${projectId} is within user's zone scope`,
        });
      } catch {
        explanation.push({
          step: 'ZONE_SCOPE',
          result: false,
          message: 'Zone scope resolution failed',
        });
      }
    }

    const hasProjectAccess = activeRoleId
      ? await this.hasProjectAccessForRole(userId, projectId, activeRoleId)
      : await this.hasProjectAccess(userId, projectId);
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

    const hasRolePermission = await this.hasRolePermission(
      userId,
      projectId,
      module.id,
      action.id,
      activeRoleId,
    );
    if (hasRolePermission) {
      const userRoles = await this.userRoleRepo.find({
        where: { userId },
        relations: { role: true },
      });
      const filteredRoles = activeRoleId ? userRoles.filter((ur) => ur.roleId === activeRoleId) : userRoles;
      const roleNames = (filteredRoles.length ? filteredRoles : userRoles).map((ur) => ur.role.name).join(', ');
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

    const hasTemplatePermission = await this.hasTemplatePermission(
      userId,
      projectId,
      module.id,
      action.id,
    );
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

    const hasProfilePermission = await this.hasProfilePermission(
      userId,
      projectId,
      module.id,
      action.id,
      activeRoleId,
    );
    if (hasProfilePermission) {
      explanation.push({
        step: 'PROFILE_PERMISSION',
        result: true,
        message: 'Allowed through permission profile',
      });
      return { allowed: true, source: 'profile', explanation };
    }
    explanation.push({
      step: 'PROFILE_PERMISSION',
      result: false,
      message: 'No profile-based permission found',
    });

    explanation.push({
      step: 'DEFAULT_DENY',
      result: false,
      message: 'No matching permission found — default DENY',
    });
    return { allowed: false, source: 'denied', explanation };
  }

  async getUserPermissions(userId: string, activeRoleId?: number | null): Promise<UserPermissionsResponse> {
    const user = await this.userRepo.findOne({ where: { empId: userId } });
    const allModules = await this.moduleRepo.find({
      where: { isActive: true },
    });
    const allActions = await this.actionRepo.find({
      where: { isActive: true },
    });
    const allActionCodes = allActions.map((a) => a.code);

    if (!user || !user.isActive || user.deletedAt) {
      return {
        user: { empId: userId, name: '', email: '', roles: [] },
        projects: [],
        permissions: {
          modules: allModules.map((m) => ({
            code: m.code || m.name.toUpperCase().replace(/\s+/g, '_'),
            name: m.name,
            route: '',
            allowed: true,
            actions: allActionCodes,
          })),
        },
      };
    }

    const isSuperAdmin = await this.isSuperAdmin(userId);
    const userRoles = await this.userRoleRepo.find({
      where: { userId },
      relations: { role: true },
    });
    const roleNames = userRoles.map((ur) => ur.role.name);

    // Build flat module permissions for frontend nav (fast, no project iteration needed)
    const flatModules = allModules.map((m) => ({
      code: m.code || m.name.toUpperCase().replace(/\s+/g, '_'),
      name: m.name,
      route: '',
      allowed: true,
      actions: allActionCodes,
    }));

    // Get project entities
    let projectEntities: { id: number; name: string }[];
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
    } else {
      projectEntities = [];
      const projectIds = await this.getUserProjectIds(userId);
      if (projectIds.length > 0) {
        const placeholders = projectIds.map((_, i) => `$${i + 1}`).join(',');
        const rows = await this.dataSource.query(
          `SELECT id, name FROM projects WHERE id IN (${placeholders})`,
          projectIds,
        );
        projectEntities = rows.map((p: any) => ({
          id: Number(p.id),
          name: p.name,
        }));
      }
      if (projectEntities.length === 0) {
        const rows = await this.dataSource.query(
          `SELECT id, name FROM projects`,
        );
        projectEntities = rows.map((p: any) => ({
          id: Number(p.id),
          name: p.name,
        }));
      }
      // Filter projects by zone scope (skip if user has no zone assignments)
      try {
        const scope = activeRoleId
          ? await this.scopeService.resolveUserScopeForRole(userId, activeRoleId).catch(() => this.scopeService.resolveUserScope(userId))
          : await this.scopeService.resolveUserScope(userId);
        if (scope.resources.zones.length > 0) {
          projectEntities = projectEntities.filter((p) =>
            scope.hasProject(p.id),
          );
        }
      } catch {
        // if scope resolution fails, fall back to unfiltered projects
      }
      // If activeRoleId filters to zero projects but role has RoleProjectPermissions, keep those projects via role scope
      if (activeRoleId && projectEntities.length === 0) {
        try {
          const roleProjectIds = await this.getProjectIdsForRole(activeRoleId);
          if (roleProjectIds.length > 0) {
            const placeholders = roleProjectIds.map((_, i) => `$${i + 1}`).join(',');
            const rows = await this.dataSource.query(
              `SELECT id, name FROM projects WHERE id IN (${placeholders})`,
              roleProjectIds,
            );
            projectEntities = rows.map((p: any) => ({ id: Number(p.id), name: p.name }));
          }
        } catch {}
      }
    }

    const result: UserPermissionsResponse = {
      user: {
        empId: user.empId,
        name: user.name,
        email: user.email,
        roles: roleNames,
      },
      permissions: { modules: flatModules },
      projects: [],
    };

    // For /permissions/me, return lightweight projects (nav doesn't use nested modules)
    // Keep a few projects with full data for other consumers
    const projectCount = projectEntities.length;
    if (isSuperAdmin) {
      const nestedModules = await this.getSuperAdminNestedModules(
        allModules,
        allActions,
      );
      if (projectCount === 0) {
        // SUPER_ADMIN with no projects — provide a virtual project so frontend permission checks pass
        result.projects.push({
          id: 0,
          name: 'All Projects',
          modules: nestedModules,
        });
      } else {
        for (let i = 0; i < projectCount; i++) {
          const proj = projectEntities[i];
          result.projects.push({
            id: proj.id,
            name: proj.name,
            modules: i === 0 ? nestedModules : [],
          });
        }
      }
    } else {
      for (let i = 0; i < projectCount; i++) {
        const proj = projectEntities[i];
        const modules = await this.getUserModulePermissionsNested(userId, proj.id, false, activeRoleId ?? null);
        result.projects.push({ id: proj.id, name: proj.name, modules });
      }
    }

    return result;
  }

  private async getSuperAdminNestedModules(
    allModules: Module[],
    allActions: Action[],
  ): Promise<
    {
      id: number;
      name: string;
      subModules: {
        id: number;
        name: string;
        actions: { code: string; label: string; allowed: boolean }[];
      }[];
    }[]
  > {
    const allSubModules = await this.subModuleRepo.find({
      where: { isActive: true },
    });
    const result: {
      id: number;
      name: string;
      subModules: {
        id: number;
        name: string;
        actions: { code: string; label: string; allowed: boolean }[];
      }[];
    }[] = [];

    for (const mod of allModules) {
      const subModules = allSubModules.filter((sm) => sm.moduleId === mod.id);
      const subModuleEntries: {
        id: number;
        name: string;
        actions: { code: string; label: string; allowed: boolean }[];
      }[] = [];

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
      } else {
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

      result.push({ id: mod.id, name: mod.name, subModules: subModuleEntries });
    }

    return result;
  }

  async canAccess(context: PermissionContext): Promise<boolean> {
    const result = await this.resolve(context);
    return result.allowed;
  }

  async assertOrThrow(context: PermissionContext): Promise<void> {
    const result = await this.resolve(context);
    if (!result.allowed) {
      this.logger.warn(
        `Permission denied: user=${context.userId} project=${context.projectId} module=${context.moduleCode} action=${context.actionCode} reason=${result.reason}`,
      );
      throw new ForbiddenException('Insufficient permissions');
    }
  }

  private async isSuperAdmin(userId: string): Promise<boolean> {
    const roles = await this.userRoleRepo.find({
      where: { userId },
      relations: { role: true },
    });
    return roles.some((ur) => ur.role.name === 'SUPER_ADMIN');
  }

  private async hasProjectAccess(
    userId: string,
    projectId: number,
  ): Promise<boolean> {
    const directAccess = await this.accessRepo.findOne({
      where: { userId, projectId },
    });
    if (directAccess) return true;

    const groups = await this.upgRepo.find({
      where: { userId },
      relations: { group: true },
    });
    const groupIds = groups.map((g) => g.groupId);
    if (groupIds.length === 0) return false;

    const groupProjects = await this.pgpRepo.find({
      where: { groupId: In(groupIds), projectId },
    });
    return groupProjects.length > 0;
  }

  private async getUserProjectIds(userId: string): Promise<number[]> {
    const directIds = (await this.accessRepo.find({ where: { userId } })).map(
      (a) => a.projectId,
    );
    const groups = await this.upgRepo.find({ where: { userId } });
    const groupIds = groups.map((g) => g.groupId);
    if (groupIds.length > 0) {
      const groupProjectIds = (
        await this.pgpRepo.find({ where: { groupId: In(groupIds) } })
      ).map((p) => p.projectId);
      return [...new Set([...directIds, ...groupProjectIds])];
    }
    return directIds;
  }

  private async hasProjectAccessForRole(userId: string, projectId: number, activeRoleId: number): Promise<boolean> {
    // For active-role model, project access is filtered through role-project-permission if exists,
    // fallback to user_project_access. If role has any project mapping, enforce it.
    const roleProjectCount = await this.rppRepo.count({ where: { roleId: activeRoleId, projectId } });
    if (roleProjectCount > 0) return true;
    // Also check roleActionPermission existence as signal that role generally scoped? fallback to user access
    const hasUserAccess = await this.hasProjectAccess(userId, projectId);
    if (hasUserAccess) {
      // If role has at least one project mapping elsewhere, and current project not in it, deny? Strict.
      const anyRoleProject = await this.rppRepo.count({ where: { roleId: activeRoleId } });
      if (anyRoleProject > 0) return false;
      return true;
    }
    return false;
  }

  private async getProjectIdsForRole(roleId: number): Promise<number[]> {
    const rows = await this.rppRepo.find({ where: { roleId } });
    return [...new Set(rows.map((r) => r.projectId))];
  }

  private async hasRolePermission(
    userId: string,
    projectId: number,
    moduleId: number,
    actionId: number,
    activeRoleId?: number | null,
  ): Promise<boolean> {
    const userRoles = await this.userRoleRepo.find({ where: { userId } });
    if (userRoles.length === 0) return false;

    let roleIds: number[];
    if (activeRoleId != null) {
      const valid = userRoles.some((ur) => ur.roleId === activeRoleId);
      // Also allow role via profile (BUDDY_RM) not in user_roles: we still check DB directly
      if (!valid) {
        roleIds = [activeRoleId];
      } else {
        roleIds = [activeRoleId];
      }
    } else {
      roleIds = userRoles.map((ur) => ur.roleId);
    }
    const count = await this.rppRepo.count({
      where: {
        roleId: In(roleIds),
        projectId,
        moduleId,
        actionId,
      },
    });
    if (count > 0) return true;

    const effectiveRolesForDept = activeRoleId != null
      ? userRoles.filter((ur) => ur.roleId === activeRoleId)
      : userRoles;
    const deptIds = effectiveRolesForDept
      .map((ur) => ur.departmentId)
      .filter((d): d is number => d != null);
    const zoneDeptPairs = deptIds.length > 0
      ? await this.dataSource.query(
          `SELECT d.id as dept_id, d.zone_id FROM departments d WHERE d.id IN (${deptIds.join(',')})`,
        )
      : [];

    const rapCount = await this.rapRepo.count({
      where: [
        { roleId: In(roleIds), moduleId, actionId, zoneId: IsNull(), departmentId: IsNull() },
        ...zoneDeptPairs.map((pair: any) => ({
          roleId: In(roleIds),
          moduleId,
          actionId,
          zoneId: pair.zone_id,
          departmentId: pair.dept_id,
        })),
      ],
    });
    return rapCount > 0;
  }

  private async hasTemplatePermission(
    userId: string,
    projectId: number,
    moduleId: number,
    actionId: number,
  ): Promise<boolean> {
    const templates = await this.uptRepo.find({ where: { userId, projectId } });
    if (templates.length === 0) return false;

    const templateIds = templates.map((t) => t.templateId);
    const count = await this.tpRepo.count({
      where: {
        templateId: In(templateIds),
        moduleId,
        actionId,
      },
    });
    return count > 0;
  }

  private async hasProfilePermission(
    userId: string,
    projectId: number,
    moduleId: number,
    actionId: number,
    activeRoleId?: number | null,
  ): Promise<boolean> {
    let profiles: PermissionProfile[] = [];
    try {
      const now = new Date();
      // If activeRoleId specified, filter to profiles matching that role; else all
      const where: any = { userId };
      if (activeRoleId != null) {
        // TypeORM OR: we fetch all and filter in memory to handle null/profileType logic
      }
      profiles = await this.profileRepo.find({
        where,
        relations: { modules: { subModules: { projects: true } } },
      });
      // Filter by activeRoleId and expiry/status in memory
      profiles = profiles.filter((p: any) => {
        if (activeRoleId != null && p.roleId != null && p.roleId !== activeRoleId) return false;
        if (p.status && p.status !== 'ACTIVE') return false;
        if (p.expiresAt && new Date(p.expiresAt) <= now) return false;
        return true;
      });
    } catch {
      return false;
    }
    if (!profiles.length) return false;

    const moduleActions = await this.moduleActionRepo.find({
      where: { moduleId, actionId, isActive: true },
    });
    if (!moduleActions.length) return false;

    const allowedSubModuleIds = moduleActions
      .filter((ma) => ma.subModuleId)
      .map((ma) => ma.subModuleId);

    for (const profile of profiles) {
      for (const mod of profile.modules ?? []) {
        if (mod.moduleId !== moduleId) continue;
        for (const sm of mod.subModules ?? []) {
          if (
            allowedSubModuleIds.length > 0 &&
            !allowedSubModuleIds.includes(sm.subModuleId)
          )
            continue;
          // inherit_future_projects grants access to all projects
          if (sm.inheritFutureProjects) return true;
          for (const proj of sm.projects ?? []) {
            if (proj.projectId === projectId) return true;
          }
        }
      }
    }
    return false;
  }

  private async getUserModulePermissionsNested(
    userId: string,
    projectId: number,
    isSuperAdmin: boolean,
    activeRoleId?: number | null,
  ): Promise<
    {
      id: number;
      name: string;
      subModules: {
        id: number;
        name: string;
        actions: { code: string; label: string; allowed: boolean }[];
      }[];
    }[]
  > {
    const modules = await this.moduleRepo.find({ where: { isActive: true } });
    const allSubModules = await this.subModuleRepo.find({
      where: { isActive: true },
    });
    const allActions = await this.actionRepo.find({
      where: { isActive: true },
    });

    // Hoisted single-pass fetches (independent of module) to avoid N+1
    let userRoles: UserRole[] = [];
    let roleIds: number[] = [];
    let rolePermsAll: RoleProjectPermission[] = [];
    let roleActionPermsAll: RoleActionPermission[] = [];
    let templatePermsAll: TemplatePermission[] = [];
    let overridesAll: UserPermissionOverride[] = [];
    let profiles: PermissionProfile[] = [];

    if (!isSuperAdmin) {
      userRoles = await this.userRoleRepo.find({ where: { userId } });
      const now = new Date();
      // Filter expired assignments when activeRoleId specified? Keep logic: if activeRoleId, only that role; else filter valid only?
      if (activeRoleId != null) {
        const validMatch = userRoles.find((ur) => ur.roleId === activeRoleId && !(ur as any).expiresAt ? true : (ur as any).expiresAt ? new Date((ur as any).expiresAt) > now : true);
        if (validMatch) {
          roleIds = [activeRoleId];
        } else {
          // Even if not found in userRoles (Buddy RM via profile), still use activeRoleId for permission lookup
          roleIds = [activeRoleId];
        }
      } else {
        roleIds = userRoles
          .filter((ur) => {
            const exp = (ur as any).expiresAt as Date | null;
            if (exp && new Date(exp) <= now) return false;
            return true;
          })
          .map((ur) => ur.roleId);
      }
      if (roleIds.length > 0) {
        rolePermsAll = await this.rppRepo.find({
          where: { roleId: In(roleIds), projectId },
        });
        roleActionPermsAll = await this.rapRepo.find({
          where: { roleId: In(roleIds) },
        });
      }
      const templates = await this.uptRepo.find({
        where: { userId, projectId },
      });
      const templateIds = templates.map((t) => t.templateId);
      if (templateIds.length > 0) {
        templatePermsAll = await this.tpRepo.find({
          where: { templateId: In(templateIds) },
        });
      }
      overridesAll = await this.upoRepo.find({
        where: { userId, projectId },
      });

      // Fetch profile-based module access (once per call)
      try {
        profiles = await this.profileRepo.find({
          where: { userId },
          relations: { modules: { subModules: { projects: true } } },
        });
        // Filter profiles by activeRoleId and expiry
        profiles = profiles.filter((p: any) => {
          if (activeRoleId != null && p.roleId != null && p.roleId !== activeRoleId) return false;
          if (p.status && p.status !== 'ACTIVE') return false;
          if (p.expiresAt && new Date(p.expiresAt) <= now) return false;
          return true;
        });
      } catch {
        // profile table may not exist
      }
    }

    const result: {
      id: number;
      name: string;
      subModules: {
        id: number;
        name: string;
        actions: { code: string; label: string; allowed: boolean }[];
      }[];
    }[] = [];

    for (const mod of modules) {
      const subModules = allSubModules.filter((sm) => sm.moduleId === mod.id);
      const subModuleEntries: {
        id: number;
        name: string;
        actions: { code: string; label: string; allowed: boolean }[];
      }[] = [];

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
        } else {
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
      } else {
        const rolePerms = rolePermsAll.filter(
          (p) => p.moduleId === mod.id,
        );
        const roleActionPerms = roleActionPermsAll.filter(
          (p) => p.moduleId === mod.id,
        );
        const templatePerms = templatePermsAll.filter(
          (p) => p.moduleId === mod.id,
        );
        const overrides = overridesAll.filter((o) => o.moduleId === mod.id);

        if (subModules.length > 0) {
          for (const sm of subModules) {
            const smRolePerms = rolePerms.filter(
              (p) => p.subModuleId === sm.id,
            );
            const smTemplatePerms = templatePerms.filter(
              (p) => p.subModuleId === sm.id,
            );
            const smOverrides = overrides.filter(
              (o) => o.subModuleId === sm.id,
            );

            const grantedActionIds = new Set<number>();
            for (const p of smRolePerms) grantedActionIds.add(p.actionId);
            for (const p of roleActionPerms) {
              if (p.subModuleId == null || p.subModuleId === sm.id)
                grantedActionIds.add(p.actionId);
            }
            for (const p of smTemplatePerms) grantedActionIds.add(p.actionId);
            for (const o of smOverrides) {
              if (o.permissionType === 'DENY')
                grantedActionIds.delete(o.actionId);
              if (o.permissionType === 'ALLOW')
                grantedActionIds.add(o.actionId);
            }

            // Check profile-based access for this subModule + project
            for (const profile of profiles) {
              for (const pMod of profile.modules ?? []) {
                if (pMod.moduleId !== mod.id) continue;
                for (const pSm of pMod.subModules ?? []) {
                  if (pSm.subModuleId !== sm.id) continue;
                  if (pSm.inheritFutureProjects) {
                    for (const a of allActions) grantedActionIds.add(a.id);
                  } else {
                    for (const pProj of pSm.projects ?? []) {
                      if (pProj.projectId === projectId) {
                        for (const a of allActions) grantedActionIds.add(a.id);
                      }
                    }
                  }
                }
              }
            }

            const actions = allActions
              .filter((a) => grantedActionIds.has(a.id))
              .map((a) => ({ code: a.code, label: a.label, allowed: true }));

            if (actions.length > 0) {
              subModuleEntries.push({ id: sm.id, name: sm.name, actions });
            }
          }
        } else {
          const grantedActionIds = new Set<number>();
          for (const p of rolePerms) grantedActionIds.add(p.actionId);
          for (const p of roleActionPerms) grantedActionIds.add(p.actionId);
          for (const p of templatePerms) grantedActionIds.add(p.actionId);
          for (const o of overrides) {
            if (o.permissionType === 'DENY')
              grantedActionIds.delete(o.actionId);
            if (o.permissionType === 'ALLOW') grantedActionIds.add(o.actionId);
          }

          // Check profile-based access for this module (no subModules)
          for (const profile of profiles) {
            for (const pMod of profile.modules ?? []) {
              if (pMod.moduleId !== mod.id) continue;
              for (const pSm of pMod.subModules ?? []) {
                if (pSm.inheritFutureProjects) {
                  for (const a of allActions) grantedActionIds.add(a.id);
                } else {
                  for (const pProj of pSm.projects ?? []) {
                    if (pProj.projectId === projectId) {
                      for (const a of allActions) grantedActionIds.add(a.id);
                    }
                  }
                }
              }
            }
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
        result.push({
          id: mod.id,
          name: mod.name,
          subModules: subModuleEntries,
        });
      }
    }

    return result;
  }
}
