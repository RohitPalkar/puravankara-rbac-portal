import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProjectAccess } from '../entities/user-project-access.entity';
import { ProjectGroup } from '../entities/project-group.entity';
import { ProjectGroupProject } from '../entities/project-group-project.entity';
import { UserProjectGroup } from '../entities/user-project-group.entity';
import { BaseService } from '../../../common/crud/base.service';
import {
  PaginationQuery,
  PaginatedResult,
} from '../../../common/crud/crud.interface';
import { PermissionCompilerService } from '../../permissions/services/permission-compiler.service';
import { NotificationService } from '../../notifications/services/notification.service';

@Injectable()
export class UserProjectAccessService {
  constructor(
    @InjectRepository(UserProjectAccess)
    readonly repository: Repository<UserProjectAccess>,
    private readonly compilerService: PermissionCompilerService,
    private readonly notifService: NotificationService,
  ) {}

  async findByUser(userId: string): Promise<UserProjectAccess[]> {
    return this.repository.find({
      where: { userId },
      relations: { project: true },
    });
  }

  async assign(dto: {
    userId: string;
    projectId: number;
    assignedBy?: string;
  }): Promise<UserProjectAccess> {
    const existing = await this.repository.findOne({
      where: { userId: dto.userId, projectId: dto.projectId },
    });
    if (existing)
      throw new ConflictException('User already has access to this project');

    const access = this.repository.create({
      userId: dto.userId,
      projectId: dto.projectId,
      assignedBy: dto.assignedBy,
      assignedAt: new Date(),
    });
    const saved = await this.repository.save(access);

    this.notifService
      .sendToUser(
        dto.userId,
        'Project Access Granted',
        `You have been granted access to project #${dto.projectId}`,
        'PROJECT_ACCESS',
        String(dto.projectId),
        'PROJECT',
        'HIGH',
      )
      .catch(() => {});

    this.compilerService
      .compileAndSave(dto.userId, dto.projectId)
      .catch(() => {});

    return saved;
  }

  async assignBulk(dto: {
    userId: string;
    projectIds: number[];
    assignedBy?: string;
  }): Promise<UserProjectAccess[]> {
    const results: UserProjectAccess[] = [];
    for (const projectId of dto.projectIds) {
      try {
        const access = await this.assign({
          userId: dto.userId,
          projectId,
          assignedBy: dto.assignedBy,
        });
        results.push(access);
      } catch {
        // skip duplicates
      }
    }
    return results;
  }

  async revoke(userId: string, projectId: number): Promise<void> {
    const result = await this.repository.delete({ userId, projectId });
    if (result.affected === 0)
      throw new NotFoundException('Project access not found');

    this.compilerService.compileAndSave(userId, projectId).catch(() => {});
  }
}

@Injectable()
export class ProjectGroupService extends BaseService<ProjectGroup> {
  constructor(
    @InjectRepository(ProjectGroup)
    readonly repository: Repository<ProjectGroup>,
  ) {
    super(repository);
  }
}

@Injectable()
export class ProjectGroupProjectService {
  constructor(
    @InjectRepository(ProjectGroupProject)
    readonly repository: Repository<ProjectGroupProject>,
  ) {}

  async findByGroup(groupId: number): Promise<ProjectGroupProject[]> {
    return this.repository.find({
      where: { groupId },
      relations: { project: true },
    });
  }

  async addProject(
    groupId: number,
    projectId: number,
  ): Promise<ProjectGroupProject> {
    const pgp = this.repository.create({ groupId, projectId });
    return this.repository.save(pgp);
  }

  async removeProject(groupId: number, projectId: number): Promise<void> {
    await this.repository.delete({ groupId, projectId });
  }
}

@Injectable()
export class UserProjectGroupService {
  constructor(
    @InjectRepository(UserProjectGroup)
    readonly repository: Repository<UserProjectGroup>,
  ) {}

  async findByUser(userId: string): Promise<UserProjectGroup[]> {
    return this.repository.find({
      where: { userId },
      relations: { group: true },
    });
  }

  async assign(dto: {
    userId: string;
    groupId: number;
    assignedBy?: string;
  }): Promise<UserProjectGroup> {
    const upg = this.repository.create({
      userId: dto.userId,
      groupId: dto.groupId,
      assignedBy: dto.assignedBy,
      assignedAt: new Date(),
    });
    return this.repository.save(upg);
  }

  async revoke(userId: string, groupId: number): Promise<void> {
    await this.repository.delete({ userId, groupId });
  }
}
