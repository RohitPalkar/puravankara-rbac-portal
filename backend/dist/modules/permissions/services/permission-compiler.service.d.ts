import { Repository } from 'typeorm';
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
interface FeatureMatrixModule {
    id: number;
    name: string;
    subModules: {
        id: number;
        name: string;
        actions: string[];
    }[];
}
export declare class PermissionCompilerService {
    private readonly userRepo;
    private readonly userRoleRepo;
    private readonly roleRepo;
    private readonly rppRepo;
    private readonly uptRepo;
    private readonly tpRepo;
    private readonly upoRepo;
    private readonly accessRepo;
    private readonly upgRepo;
    private readonly pgpRepo;
    private readonly matrixRepo;
    private readonly historyRepo;
    private readonly moduleRepo;
    private readonly subModuleRepo;
    private readonly actionRepo;
    private readonly cacheService;
    private readonly logger;
    constructor(userRepo: Repository<User>, userRoleRepo: Repository<UserRole>, roleRepo: Repository<Role>, rppRepo: Repository<RoleProjectPermission>, uptRepo: Repository<UserPermissionTemplate>, tpRepo: Repository<TemplatePermission>, upoRepo: Repository<UserPermissionOverride>, accessRepo: Repository<UserProjectAccess>, upgRepo: Repository<UserProjectGroup>, pgpRepo: Repository<ProjectGroupProject>, matrixRepo: Repository<UserProjectFeatureMatrix>, historyRepo: Repository<PermissionSnapshotHistory>, moduleRepo: Repository<Module>, subModuleRepo: Repository<SubModule>, actionRepo: Repository<Action>, cacheService: PermissionCacheService);
    compileForUser(userId: string, projectId: number): Promise<FeatureMatrixModule[]>;
    compileAndSave(userId: string, projectId: number, changedBy?: string): Promise<void>;
    compileForRole(roleId: number): Promise<void>;
    compileForUsersByProject(projectId: number): Promise<void>;
    getCompiled(userId: string, projectId: number): Promise<{
        modules: FeatureMatrixModule[];
    }>;
    compileForAllUserProjects(userId: string): Promise<void>;
    invalidateSnapshot(userId: string, projectId: number): Promise<void>;
    private isSuperAdmin;
    private hasModuleAccess;
    private resolveModuleActions;
    private resolveSubModuleActions;
}
export {};
