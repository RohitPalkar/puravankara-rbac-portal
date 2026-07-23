import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleProjectPermission } from './entities/role-project-permission.entity';
import { RoleActionPermission } from './entities/role-action-permission.entity';
import { PermissionTemplate } from './entities/permission-template.entity';
import { TemplatePermission } from './entities/template-permission.entity';
import { UserPermissionTemplate } from './entities/user-permission-template.entity';
import { UserPermissionOverride } from './entities/user-permission-override.entity';
import { PermissionScope } from './entities/permission-scope.entity';
import { ActionPermissionScope } from './entities/action-permission-scope.entity';
import { UserProjectFeatureMatrix } from './entities/user-project-feature-matrix.entity';
import { PermissionSnapshotHistory } from './entities/permission-snapshot-history.entity';
import { PermissionProfile } from './entities/permission-profile.entity';
import { PermissionProfileModule } from './entities/permission-profile-module.entity';
import { PermissionProfileSubModule } from './entities/permission-profile-sub-module.entity';
import { PermissionProfileProject } from './entities/permission-profile-project.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { UserZone } from '../users/entities/user-zone.entity';
import { Role } from '../organization/entities/role.entity';
import { UserProjectAccess } from '../project-access/entities/user-project-access.entity';
import { UserProjectGroup } from '../project-access/entities/user-project-group.entity';
import { ProjectGroupProject } from '../project-access/entities/project-group-project.entity';
import { Project } from '../projects/entities/project.entity';
import { ProjectLocation } from '../projects/entities/project-location.entity';
import { Zone } from '../geography/entities/zone.entity';
import { Module as ProductModule } from '../product-catalog/entities/module.entity';
import { SubModule } from '../product-catalog/entities/sub-module.entity';
import { ActionGroup } from '../product-catalog/entities/action-group.entity';
import { ModuleAction } from '../product-catalog/entities/module-action.entity';
import { Action } from '../product-catalog/entities/action.entity';
import { PermissionService } from './services/permission.service';
import { UserPermissionOverrideService } from './services/user-permission-override.service';
import { PermissionTemplateService } from './services/permission-template.service';
import { PermissionCacheService } from './services/permission-cache.service';
import { PermissionCompilerService } from './services/permission-compiler.service';
import { PermissionProfileService } from './services/permission-profile.service';
import { RoleActionPermissionService } from './services/role-action-permission.service';
import { ScopeResolutionService } from './services/scope-resolution.service';
import { PermissionGuard } from './guards/permission.guard';
import { PermissionController } from './permission.controller';
import { UserPermissionOverrideController } from './user-permission-override.controller';
import { PermissionTemplateController } from './permission-template.controller';
import { RoleProjectPermissionController } from './role-project-permission.controller';
import { RoleProjectPermissionService } from './services/role-project-permission.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoleProjectPermission,
      RoleActionPermission,
      PermissionTemplate,
      TemplatePermission,
      UserPermissionTemplate,
      UserPermissionOverride,
      PermissionScope,
      ActionPermissionScope,
      UserProjectFeatureMatrix,
      PermissionSnapshotHistory,
      PermissionProfile,
      PermissionProfileModule,
      PermissionProfileSubModule,
      PermissionProfileProject,
      User,
      UserRole,
      UserZone,
      Role,
      UserProjectAccess,
      UserProjectGroup,
      ProjectGroupProject,
      Project,
      ProjectLocation,
      Zone,
      ProductModule,
      SubModule,
      ActionGroup,
      ModuleAction,
      Action,
    ]),
  ],
  controllers: [
    PermissionController,
    UserPermissionOverrideController,
    PermissionTemplateController,
    RoleProjectPermissionController,
  ],
  providers: [
    PermissionService,
    UserPermissionOverrideService,
    PermissionTemplateService,
    RoleProjectPermissionService,
    RoleActionPermissionService,
    PermissionCacheService,
    PermissionCompilerService,
    PermissionProfileService,
    ScopeResolutionService,
    PermissionGuard,
  ],
  exports: [
    PermissionService,
    PermissionCacheService,
    PermissionCompilerService,
    ScopeResolutionService,
    PermissionGuard,
    RoleActionPermissionService,
    TypeOrmModule,
  ],
})
export class PermissionsModule {}
