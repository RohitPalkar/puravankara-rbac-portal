import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProjectAccess } from './entities/user-project-access.entity';
import { ProjectGroup } from './entities/project-group.entity';
import { ProjectGroupProject } from './entities/project-group-project.entity';
import { UserProjectGroup } from './entities/user-project-group.entity';
import {
  UserProjectAccessService,
  ProjectGroupService,
  ProjectGroupProjectService,
  UserProjectGroupService,
} from './services/project-access.service';
import {
  UserProjectAccessController,
  ProjectGroupController,
  ProjectGroupProjectController,
  UserProjectGroupController,
} from './controllers/project-access.controller';
import { PermissionsModule } from '../permissions/permissions.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserProjectAccess,
      ProjectGroup,
      ProjectGroupProject,
      UserProjectGroup,
    ]),
    PermissionsModule,
    NotificationsModule,
  ],
  controllers: [
    UserProjectAccessController,
    ProjectGroupController,
    ProjectGroupProjectController,
    UserProjectGroupController,
  ],
  providers: [
    UserProjectAccessService,
    ProjectGroupService,
    ProjectGroupProjectService,
    UserProjectGroupService,
  ],
  exports: [TypeOrmModule],
})
export class ProjectAccessModule {}
