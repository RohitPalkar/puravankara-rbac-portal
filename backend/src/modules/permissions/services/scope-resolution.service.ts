import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
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
    @InjectDataSource()
    private readonly dataSource: DataSource,
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

  async resolveUserScopeForRole(userId: string, roleId: number): Promise<UserScope> {
    // Role-filtered scope: intersect user zones with role's department zone
    try {
      const rows: any[] = await this.dataSource.query(
        `SELECT ur.department_id, d.zone_id
         FROM user_roles ur
         LEFT JOIN departments d ON d.id = ur.department_id
         WHERE ur.user_id = $1 AND ur.role_id = $2
         LIMIT 1`,
        [userId, roleId],
      );
      if (!rows || rows.length === 0 || rows[0].zone_id == null) {
        // No department zone mapping for this role — fallback to global scope
        return this.resolveUserScope(userId);
      }
      const roleZoneId = Number(rows[0].zone_id);
      const userZones = await this.userZoneRepo.find({
        where: { userId },
        relations: { zone: true },
      });
      const hasZone = userZones.some((uz) => uz.zoneId === roleZoneId);
      // If user is assigned to role's zone, scope is that zone only; else keep global but will fail hasProject checks
      const targetZoneIds = hasZone ? [roleZoneId] : userZones.map((uz) => uz.zoneId);
      if (targetZoneIds.length === 0) {
        // No zone assignments — return empty project scope (fallback allows all projects via hasProject logic)
        const empty: UserScope = {
          userId,
          resources: { zones: [], projects: [] },
          hasProject: () => false,
          hasZone: () => false,
        };
        // Try to scope to roleZone projects even if user has no zones
        const pls = await this.projectLocationRepo.find({ where: { zoneId: In([roleZoneId]) } });
        const pids = new Set<number>(pls.map((pl) => pl.projectId));
        if (pids.size > 0) {
          const projs = await this.projectRepo.find({ where: { id: In([...pids]) } });
          const projects: ResourceInfo[] = projs.map((p) => ({ id: p.id, name: p.name }));
          empty.resources = { zones: [{ id: roleZoneId, name: `Zone ${roleZoneId}` }], projects };
          empty.hasProject = (pid: number) => pids.has(pid);
          empty.hasZone = (z: number) => z === roleZoneId;
          return empty;
        }
        return empty;
      }
      const projectIdSet = new Set<number>();
      const pls = await this.projectLocationRepo.find({ where: { zoneId: In(targetZoneIds) } });
      for (const pl of pls) projectIdSet.add(pl.projectId);
      const zones: ResourceInfo[] = hasZone
        ? [{ id: roleZoneId, name: userZones.find((uz) => uz.zoneId === roleZoneId)?.zone?.name ?? `Zone ${roleZoneId}` }]
        : userZones.map((uz) => ({ id: uz.zoneId, name: uz.zone?.name ?? `Zone ${uz.zoneId}` }));
      const projects: ResourceInfo[] = [];
      if (projectIdSet.size > 0) {
        const projectEntities = await this.projectRepo.find({ where: { id: In([...projectIdSet]) } });
        for (const p of projectEntities) projects.push({ id: p.id, name: p.name });
      }
      return {
        userId,
        resources: { zones, projects },
        hasProject: (pid: number) => projectIdSet.has(pid),
        hasZone: (z: number) => targetZoneIds.includes(z),
      };
    } catch (e) {
      this.logger.warn(`resolveUserScopeForRole fallback for ${userId} role ${roleId}: ${(e as Error).message}`);
      return this.resolveUserScope(userId);
    }
  }
}
