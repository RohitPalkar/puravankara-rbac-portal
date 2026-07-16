import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { BaseService } from '../../../common/crud/base.service';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';
export declare class ProjectService extends BaseService<Project> {
    readonly repository: Repository<Project>;
    constructor(repository: Repository<Project>);
    create(dto: CreateProjectDto): Promise<Project>;
    update(id: number, dto: UpdateProjectDto): Promise<Project>;
}
