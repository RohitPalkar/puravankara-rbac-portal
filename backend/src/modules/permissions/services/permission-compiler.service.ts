import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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
import { UserProjectFeatureMatrix } from '../entities/user-project-feature-matrix.entity';
import { PermissionSnapshotHistory } from '../entities/permission-snapshot-history.entity';
import { Module } from '../../product-catalog/entities/module.entity';
import { SubModule } from '../../product-catalog/entities/sub-module.entity';
import { Action } from '../../product-catalog/entities/action.entity';
import { PermissionCacheService } from './permission-cache.service';
import { PermissionProfile } from '../entities/permission-profile.entity';
import { PermissionProfileModule } from '../entities/permission-profile-module.entity';
import { PermissionProfileSubModule } from '../entities/permission-profile-sub-module.entity';
import { PermissionProfileProject } from '../entities/permission-profile-project.entity';

interface FeatureMatrixModule {
  id: number;
  name: string;
  subModules: {
    id: number;
    name: string;
    actions: string[];
  }[];
}

@Injectable()
export class PermissionCompilerService {
  private readonly logger = new Logger(PermissionCompilerService.name);

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
    @InjectRepository(UserProjectFeatureMatrix)
    private readonly matrixRepo: Repository<UserProjectFeatureMatrix>,
    @InjectRepository(PermissionSnapshotHistory)
    private readonly historyRepo: Repository<PermissionSnapshotHistory>,
    @InjectRepository(Module)
    private readonly moduleRepo: Repository<Module>,
    @InjectRepository(SubModule)
    private readonly subModuleRepo: Repository<SubModule>,
    @InjectRepository(Action)
    private readonly actionRepo: Repository<Action>,
    @InjectRepository(PermissionProfile)
    private readonly profileRepo: Repository<PermissionProfile>,
    @InjectRepository(PermissionProfileModule)
    private readonly profileModuleRepo: Repository<PermissionProfileModule>,
    @InjectRepository(PermissionProfileSubModule)
    private readonly profileSubModuleRepo: Repository<PermissionProfileSubModule>,
    @InjectRepository(PermissionProfileProject)
    private readonly profileProjectRepo: Repository<PermissionProfileProject>,
    private readonly cacheService: PermissionCacheService,
  ) {}

  async compileForUser(
    userId: string,
    projectId: number,
  ): Promise<FeatureMatrixModule[]> {
    const user = await this.userRepo.findOne({ where: { empId: userId } });
    if (!user || !user.isActive || user.deletedAt) {
      return [];
    }

    const isSuperAdmin = await this.isSuperAdmin(userId);
    const modules = await this.moduleRepo.find({ where: { isActive: true } });
    const result: FeatureMatrixModule[] = [];

    for (const mod of modules) {
      const subModules = await this.subModuleRepo.find({
        where: { moduleId: mod.id, isActive: true },
      });

      const allowedActions = isSuperAdmin
        ? await this.actionRepo.find({ where: { isActive: true } })
        : await this.resolveModuleActions(userId, projectId, mod.id);

      const allowedActionCodes = new Set(allowedActions.map((a) => a.code));

      const featureSubModules: {
        id: number;
        name: string;
        actions: string[];
      }[] = [];

      if (isSuperAdmin) {
        if (subModules.length > 0) {
          for (const sm of subModules) {
            featureSubModules.push({
              id: sm.id,
              name: sm.name,
              actions: [...allowedActionCodes],
            });
          }
        } else {
          featureSubModules.push({
            id: 0,
            name: mod.name,
            actions: [...allowedActionCodes],
          });
        }
      } else {
        const hasModuleAccess = await this.hasModuleAccess(
          userId,
          projectId,
          mod.id,
        );
        if (!hasModuleAccess) continue;

        for (const sm of subModules) {
          const smActions = await this.resolveSubModuleActions(
            userId,
            projectId,
            mod.id,
            sm.id,
          );
          if (smActions.length > 0) {
            featureSubModules.push({
              id: sm.id,
              name: sm.name,
              actions: smActions,
            });
          }
        }

        if (subModules.length === 0) {
          const actions = await this.resolveModuleActions(
            userId,
            projectId,
            mod.id,
          );
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

  async compileAndSave(
    userId: string,
    projectId: number,
    changedBy?: string,
  ): Promise<void> {
    const document = await this.compileForUser(userId, projectId);

    let matrix = await this.matrixRepo.findOne({
      where: { userId, projectId },
    });

    if (matrix?.featurePrivilegesDocument) {
      await this.historyRepo.save(
        this.historyRepo.create({
          userId,
          projectId,
          snapshot: matrix.featurePrivilegesDocument,
          changedBy: changedBy ?? 'SYSTEM',
        }),
      );
    }

    if (matrix) {
      matrix.featurePrivilegesDocument = { modules: document };
      matrix.version += 1;
      await this.matrixRepo.save(matrix);
    } else {
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

  async compileForRole(roleId: number): Promise<void> {
    const userRoles = await this.userRoleRepo.find({ where: { roleId } });
    for (const ur of userRoles) {
      await this.compileForAllUserProjects(ur.userId);
    }
  }

  async compileForUsersByProject(projectId: number): Promise<void> {
    const accessRows = await this.accessRepo.find({ where: { projectId } });
    for (const row of accessRows) {
      await this.compileAndSave(row.userId, projectId);
    }
  }

  async getCompiled(
    userId: string,
    projectId: number,
  ): Promise<{ modules: FeatureMatrixModule[] }> {
    const cacheKey = `permissions:snapshot:${userId}:${projectId}`;
    const cached = await this.cacheService.get<{
      modules: FeatureMatrixModule[];
    }>(cacheKey);
    if (cached) return cached;

    const matrix = await this.matrixRepo.findOne({
      where: { userId, projectId },
    });

    if (matrix?.featurePrivilegesDocument) {
      const doc = matrix.featurePrivilegesDocument as {
        modules: FeatureMatrixModule[];
      };
      await this.cacheService.set(cacheKey, doc, 3600);
      return doc;
    }

    return { modules: [] };
  }

  async compileForAllUserProjects(userId: string): Promise<void> {
    const isSuperAdmin = await this.isSuperAdmin(userId);
    let projectIds: number[];

    if (isSuperAdmin) {
      const projects = await this.accessRepo
        .createQueryBuilder('upa')
        .select('upa.project_id')
        .distinct(true)
        .getRawMany();
      projectIds = projects.map((p) => Number(p.project_id));
    } else {
      const directIds = (await this.accessRepo.find({ where: { userId } })).map(
        (a) => a.projectId,
      );
      const groups = await this.upgRepo.find({ where: { userId } });
      const groupIds = groups.map((g) => g.groupId);
      if (groupIds.length > 0) {
        const groupProjectIds = (
          await this.pgpRepo.find({ where: { groupId: In(groupIds) } })
        ).map((p) => p.projectId);
        projectIds = [...new Set([...directIds, ...groupProjectIds])];
      } else {
        projectIds = directIds;
      }
    }

    for (const pid of projectIds) {
      await this.compileAndSave(userId, pid);
    }
  }

  async invalidateSnapshot(userId: string, projectId: number): Promise<void> {
    const cacheKey = `permissions:snapshot:${userId}:${projectId}`;
    await this.cacheService.invalidate(cacheKey);
  }

  private async isSuperAdmin(userId: string): Promise<boolean> {
    const roles = await this.userRoleRepo.find({
      where: { userId },
      relations: { role: true },
    });
    return roles.some(
      (ur) => ur.role?.isSystemRole === true || ur.role?.name === 'SUPER_ADMIN',
    );
  }

  private async getProfileProjectIdsForModule(
    userId: string,
    moduleId: number,
  ): Promise<number[]> {
    const profiles = await this.profileRepo.find({
      where: { userId },
      relations: { modules: { subModules: { projects: true } } },
    });

    const projectIds = new Set<number>();
    let hasInheritAll = false;
    for (const profile of profiles) {
      for (const mod of profile.modules ?? []) {
        if (mod.moduleId === moduleId) {
          for (const sm of mod.subModules ?? []) {
            if (sm.inheritFutureProjects) hasInheritAll = true;
            for (const proj of sm.projects ?? []) {
              projectIds.add(proj.projectId);
            }
          }
        }
      }
    }
    // If any sub-module has inherit_future_projects, return sentinel -1 meaning "all projects"
    if (hasInheritAll) return [-1];
    return [...projectIds];
  }

  private async hasModuleAccess(
    userId: string,
    projectId: number,
    moduleId: number,
  ): Promise<boolean> {
    const rolePerms = await this.rppRepo.findOne({
      where: {
        roleId: In(
          (await this.userRoleRepo.find({ where: { userId } })).map(
            (ur) => ur.roleId,
          ),
        ),
        projectId,
        moduleId,
      },
    });
    if (rolePerms) return true;

    const templates = await this.uptRepo.find({ where: { userId, projectId } });
    if (templates.length > 0) {
      const templateIds = templates.map((t) => t.templateId);
      const tp = await this.tpRepo.findOne({
        where: { templateId: In(templateIds), moduleId },
      });
      if (tp) return true;
    }

    const profileProjectIds = await this.getProfileProjectIdsForModule(userId, moduleId);
    if (profileProjectIds.includes(projectId) || profileProjectIds.includes(-1)) return true;

    return false;
  }

  private async resolveModuleActions(
    userId: string,
    projectId: number,
    moduleId: number,
  ): Promise<Action[]> {
    const userRoles = await this.userRoleRepo.find({ where: { userId } });
    const roleIds = userRoles.map((ur) => ur.roleId);

    const actionIds = new Set<number>();

    if (roleIds.length > 0) {
      const rolePerms = await this.rppRepo.find({
        where: { roleId: In(roleIds), projectId, moduleId },
      });
      for (const rp of rolePerms) actionIds.add(rp.actionId);
    }

    const templates = await this.uptRepo.find({ where: { userId, projectId } });
    if (templates.length > 0) {
      const templateIds = templates.map((t) => t.templateId);
      const tpPerms = await this.tpRepo.find({
        where: { templateId: In(templateIds), moduleId },
      });
      for (const tp of tpPerms) actionIds.add(tp.actionId);
    }

    const profileProjectIds = await this.getProfileProjectIdsForModule(userId, moduleId);
    if (profileProjectIds.includes(projectId) || profileProjectIds.includes(-1)) {
      const allActions = await this.actionRepo.find({ where: { isActive: true } });
      for (const a of allActions) actionIds.add(a.id);
    }

    const overrides = await this.upoRepo.find({
      where: { userId, projectId, moduleId },
    });
    for (const o of overrides) {
      if (o.permissionType === 'DENY') actionIds.delete(o.actionId);
      if (o.permissionType === 'ALLOW') actionIds.add(o.actionId);
    }

    if (actionIds.size === 0) return [];

    return this.actionRepo.find({
      where: { id: In([...actionIds]), isActive: true },
    });
  }

  private async hasProfileSubModuleProject(
    userId: string,
    projectId: number,
    moduleId: number,
    subModuleId: number,
  ): Promise<boolean> {
    const profiles = await this.profileRepo.find({
      where: { userId },
      relations: { modules: { subModules: { projects: true } } },
    });

    for (const profile of profiles) {
      for (const mod of profile.modules ?? []) {
        if (mod.moduleId !== moduleId) continue;
        for (const sm of mod.subModules ?? []) {
          if (sm.subModuleId !== subModuleId) continue;
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

  private async resolveSubModuleActions(
    userId: string,
    projectId: number,
    moduleId: number,
    subModuleId: number,
  ): Promise<string[]> {
    const userRoles = await this.userRoleRepo.find({ where: { userId } });
    const roleIds = userRoles.map((ur) => ur.roleId);

    const actionIds = new Set<number>();

    if (roleIds.length > 0) {
      const rolePerms = await this.rppRepo.find({
        where: {
          roleId: In(roleIds),
          projectId,
          moduleId,
          subModuleId,
        },
      });
      for (const rp of rolePerms) actionIds.add(rp.actionId);
    }

    const templates = await this.uptRepo.find({ where: { userId, projectId } });
    if (templates.length > 0) {
      const templateIds = templates.map((t) => t.templateId);
      const tpPerms = await this.tpRepo.find({
        where: { templateId: In(templateIds), moduleId, subModuleId },
      });
      for (const tp of tpPerms) actionIds.add(tp.actionId);
    }

    const hasProfileAccess = await this.hasProfileSubModuleProject(
      userId, projectId, moduleId, subModuleId,
    );
    if (hasProfileAccess) {
      const allActions = await this.actionRepo.find({ where: { isActive: true } });
      for (const a of allActions) actionIds.add(a.id);
    }

    const overrides = await this.upoRepo.find({
      where: { userId, projectId, moduleId, subModuleId },
    });
    for (const o of overrides) {
      if (o.permissionType === 'DENY') actionIds.delete(o.actionId);
      if (o.permissionType === 'ALLOW') actionIds.add(o.actionId);
    }

    if (actionIds.size === 0) return [];

    const actions = await this.actionRepo.find({
      where: { id: In([...actionIds]), isActive: true },
    });
    return actions.map((a) => a.code);
  }
}
