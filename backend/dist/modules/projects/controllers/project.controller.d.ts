import { ProjectService } from '../services/project.service';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';
import { Project } from '../entities/project.entity';
import { BaseController } from '../../../common/crud/base.controller';
export declare class ProjectController extends BaseController<Project, CreateProjectDto, UpdateProjectDto> {
    private readonly projectService;
    constructor(projectService: ProjectService);
}
