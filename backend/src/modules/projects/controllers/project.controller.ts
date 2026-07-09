import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProjectService } from '../services/project.service';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';
import { Project } from '../entities/project.entity';
import { BaseController } from '../../../common/crud/base.controller';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectController extends BaseController<
  Project,
  CreateProjectDto,
  UpdateProjectDto
> {
  constructor(private readonly projectService: ProjectService) {
    super(projectService, 'Project');
  }
}
