import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';
import { UserZone } from './entities/user-zone.entity';
import { UserReportingLine } from './entities/user-reporting-line.entity';
import { UserAuth } from '../auth/entities/user-auth.entity';
import { UserProjectAccess } from '../project-access/entities/user-project-access.entity';
import { PermissionProfile } from '../permissions/entities/permission-profile.entity';
import { PermissionProfileModule } from '../permissions/entities/permission-profile-module.entity';
import { PermissionProfileSubModule } from '../permissions/entities/permission-profile-sub-module.entity';
import { PermissionProfileProject } from '../permissions/entities/permission-profile-project.entity';
import { Department } from '../organization/entities/department.entity';
import { Role } from '../organization/entities/role.entity';
import { Module as ProductModule } from '../product-catalog/entities/module.entity';
import { SubModule } from '../product-catalog/entities/sub-module.entity';
import { Project } from '../projects/entities/project.entity';
import { Zone } from '../geography/entities/zone.entity';
import {
  UserService,
  UserRoleService,
  UserReportingLineService,
} from './services/user.service';
import { UserZoneService } from './services/user-zone.service';
import { UserMetadataService } from './services/user-metadata.service';
import {
  UserController,
  UserRoleController,
  UserReportingLineController,
} from './controllers/user.controller';
import { UserZoneController } from './controllers/user-zone.controller';
import { PermissionsModule } from '../permissions/permissions.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserRole,
      UserZone,
      UserReportingLine,
      UserAuth,
      UserProjectAccess,
      PermissionProfile,
      PermissionProfileModule,
      PermissionProfileSubModule,
      PermissionProfileProject,
      Department,
      Role,
      ProductModule,
      SubModule,
      Project,
      Zone,
    ]),
    PermissionsModule,
    NotificationsModule,
  ],
  controllers: [
    UserController,
    UserRoleController,
    UserReportingLineController,
    UserZoneController,
  ],
  providers: [
    UserService,
    UserRoleService,
    UserZoneService,
    UserReportingLineService,
    UserMetadataService,
  ],
  exports: [TypeOrmModule],
})
export class UsersModule {}
