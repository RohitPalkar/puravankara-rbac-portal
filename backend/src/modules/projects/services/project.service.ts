import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { BaseService } from '../../../common/crud/base.service';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';

@Injectable()
export class ProjectService extends BaseService<Project> {
  constructor(
    @InjectRepository(Project)
    readonly repository: Repository<Project>,
  ) {
    super(repository);
  }

  async create(dto: CreateProjectDto): Promise<Project> {
    return super.create(dto);
  }

  async update(id: number, dto: UpdateProjectDto): Promise<Project> {
    return super.update(id, dto);
  }
}
