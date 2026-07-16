import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectLocation } from '../entities/project-location.entity';

@Injectable()
export class ProjectLocationService {
  constructor(
    @InjectRepository(ProjectLocation)
    readonly repository: Repository<ProjectLocation>,
  ) {}

  async findAll(): Promise<ProjectLocation[]> {
    return this.repository.find({
      relations: { city: true, zone: true, project: true },
    });
  }

  async findByProject(projectId: number): Promise<ProjectLocation[]> {
    return this.repository.find({
      where: { projectId },
      relations: { city: true, zone: true },
    });
  }

  async create(dto: {
    projectId: number;
    cityId: number;
    zoneId: number;
  }): Promise<ProjectLocation> {
    const pl = this.repository.create(dto);
    return this.repository.save(pl);
  }

  async findByZone(zoneId: number): Promise<ProjectLocation[]> {
    return this.repository.find({
      where: { zoneId },
      relations: { city: true, zone: true, project: true },
    });
  }

  async remove(
    projectId: number,
    cityId: number,
    zoneId: number,
  ): Promise<void> {
    const result = await this.repository.delete({ projectId, cityId, zoneId });
    if (result.affected === 0)
      throw new NotFoundException('Project location not found');
  }
}
