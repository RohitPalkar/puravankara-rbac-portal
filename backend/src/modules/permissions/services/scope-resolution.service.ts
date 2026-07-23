import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserZone } from '../../users/entities/user-zone.entity';
import { ProjectLocation } from '../../projects/entities/project-location.entity';
import { Zone } from '../../geography/entities/zone.entity';
import { Project } from '../../projects/entities/project.entity';
import { UserScope, ResourceInfo } from '../interfaces/user-scope.interface';

@Injectable()
export class ScopeResolutionService {
  private readonly logger = new Logger(ScopeResolutionService.name);

  constructor(
    @InjectRepository(UserZone)
    private readonly userZoneRepo: Repository<UserZone>,
    @InjectRepository(ProjectLocation)
    private readonly projectLocationRepo: Repository<ProjectLocation>,
    @InjectRepository(Zone)
    private readonly zoneRepo: Repository<Zone>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async resolveUserScope(userId: string): Promise<UserScope> {
    const userZones = await this.userZoneRepo.find({
      where: { userId },
      relations: { zone: true },
    });

    const zones: ResourceInfo[] = userZones.map((uz) => ({
      id: uz.zoneId,
      name: uz.zone?.name ?? `Zone ${uz.zoneId}`,
    }));

    const zoneIds = userZones.map((uz) => uz.zoneId);
    const projectIdSet = new Set<number>();

    if (zoneIds.length > 0) {
      const projectLocations = await this.projectLocationRepo.find({
        where: { zoneId: In(zoneIds) },
      });
      for (const pl of projectLocations) {
        projectIdSet.add(pl.projectId);
      }
    }

    const projects: ResourceInfo[] = [];
    if (projectIdSet.size > 0) {
      const projectEntities = await this.projectRepo.find({
        where: { id: In([...projectIdSet]) },
      });
      for (const p of projectEntities) {
        projects.push({ id: p.id, name: p.name });
      }
    }

    const scope: UserScope = {
      userId,
      resources: { zones, projects },
      hasProject: (projectId: number) => projectIdSet.has(projectId),
      hasZone: (zoneId: number) => zoneIds.includes(zoneId),
    };

    return scope;
  }
}
