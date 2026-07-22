import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';
import { UserZone } from './entities/user-zone.entity';
import { UserReportingLine } from './entities/user-reporting-line.entity';
import { UserAuth } from '../auth/entities/user-auth.entity';
import { UserProjectAccess } from '../project-access/entities/user-project-access.entity';
import {
  UserService,
  UserRoleService,
  UserReportingLineService,
} from './services/user.service';
import { UserZoneService } from './services/user-zone.service';
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
  ],
  exports: [TypeOrmModule],
})
export class UsersModule {}
