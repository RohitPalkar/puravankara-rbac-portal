import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuditModule } from '../audit/audit.module';
import { Department } from './entities/department.entity';
import { Role } from './entities/role.entity';
import { DepartmentRole } from './entities/department-role.entity';
import { DepartmentHierarchyLevel } from './entities/department-hierarchy-level.entity';
import { DepartmentZoneMapping } from './entities/department-zone-mapping.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { UserReportingLine } from '../users/entities/user-reporting-line.entity';
import { RoleActionPermission } from '../permissions/entities/role-action-permission.entity';
import { RoleProjectPermission } from '../permissions/entities/role-project-permission.entity';
import { ApprovalStep } from '../workflows/entities/approval-step.entity';
import {
  DepartmentService,
  RoleService,
} from './services/organization.service';
import { DepartmentRoleService } from './services/department-role.service';
import { RoleMigrationService } from './services/role-migration.service';
import { LevelMigrationService } from './services/level-migration.service';
import {
  DepartmentController,
  RoleController,
} from './controllers/organization.controller';
import { DepartmentRoleController } from './controllers/department-role.controller';
import { LevelMigrationController } from './controllers/level-migration.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Department,
      Role,
      DepartmentRole,
      DepartmentHierarchyLevel,
      DepartmentZoneMapping,
      UserRole,
      UserReportingLine,
      RoleActionPermission,
      RoleProjectPermission,
      ApprovalStep,
    ]),
    PermissionsModule,
    AuditModule,
  ],
  controllers: [
    DepartmentController,
    RoleController,
    DepartmentRoleController,
    LevelMigrationController,
  ],
  providers: [
    DepartmentService,
    RoleService,
    DepartmentRoleService,
    RoleMigrationService,
    LevelMigrationService,
  ],
  exports: [TypeOrmModule],
})
export class OrganizationModule {}
