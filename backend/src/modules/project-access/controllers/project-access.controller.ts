import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  UserProjectAccessService,
  ProjectGroupService,
  ProjectGroupProjectService,
  UserProjectGroupService,
} from '../services/project-access.service';
import {
  AssignProjectAccessDto,
  AssignBulkProjectAccessDto,
  CreateProjectGroupDto,
  UpdateProjectGroupDto,
  AddProjectToGroupDto,
  AssignUserProjectGroupDto,
} from '../dto/project-access.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { ProjectGroup } from '../entities/project-group.entity';
import { BaseController } from '../../../common/crud/base.controller';

@ApiTags('Project Access')
@ApiBearerAuth()
@Controller('user-project-access')
export class UserProjectAccessController {
  constructor(private readonly svc: UserProjectAccessService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get projects accessible to a user' })
  async findByUser(@Param('userId') userId: string) {
    return this.svc.findByUser(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Assign single project to user' })
  async assign(@Body() dto: AssignProjectAccessDto) {
    return this.svc.assign(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Assign multiple projects to user' })
  async assignBulk(@Body() dto: AssignBulkProjectAccessDto) {
    return this.svc.assignBulk(dto);
  }

  @Delete(':userId/project/:projectId')
  @ApiOperation({ summary: 'Revoke project access from user' })
  async revoke(
    @Param('userId') userId: string,
    @Param('projectId') projectId: string,
  ) {
    await this.svc.revoke(userId, +projectId);
    return { message: 'Project access revoked' };
  }
}

@ApiTags('Project Access - Groups')
@ApiBearerAuth()
@Controller('project-groups')
export class ProjectGroupController extends BaseController<
  ProjectGroup,
  CreateProjectGroupDto,
  UpdateProjectGroupDto
> {
  constructor(private readonly svc: ProjectGroupService) {
    super(svc, 'ProjectGroup');
  }
}

@ApiTags('Project Access - Group Projects')
@ApiBearerAuth()
@Controller('project-group-projects')
export class ProjectGroupProjectController {
  constructor(private readonly svc: ProjectGroupProjectService) {}

  @Get(':groupId')
  @ApiOperation({ summary: 'Get projects in a group' })
  async findByGroup(@Param('groupId') groupId: string) {
    return this.svc.findByGroup(+groupId);
  }

  @Post()
  @ApiOperation({ summary: 'Add project to group' })
  async addProject(@Body() dto: AddProjectToGroupDto) {
    return this.svc.addProject(dto.groupId, dto.projectId);
  }

  @Delete(':groupId/project/:projectId')
  @ApiOperation({ summary: 'Remove project from group' })
  async removeProject(
    @Param('groupId') groupId: string,
    @Param('projectId') projectId: string,
  ) {
    await this.svc.removeProject(+groupId, +projectId);
    return { message: 'Project removed from group' };
  }
}

@ApiTags('Project Access - User Groups')
@ApiBearerAuth()
@Controller('user-project-groups')
export class UserProjectGroupController {
  constructor(private readonly svc: UserProjectGroupService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get groups for a user' })
  async findByUser(@Param('userId') userId: string) {
    return this.svc.findByUser(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Assign user to project group' })
  async assign(@Body() dto: AssignUserProjectGroupDto) {
    return this.svc.assign(dto);
  }

  @Delete(':userId/group/:groupId')
  @ApiOperation({ summary: 'Remove user from project group' })
  async revoke(
    @Param('userId') userId: string,
    @Param('groupId') groupId: string,
  ) {
    await this.svc.revoke(userId, +groupId);
    return { message: 'User removed from group' };
  }
}
