import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleProjectPermission } from '../entities/role-project-permission.entity';
import { PermissionCompilerService } from './permission-compiler.service';

@Injectable()
export class RoleProjectPermissionService {
  private readonly logger = new Logger(RoleProjectPermissionService.name);

  constructor(
    @InjectRepository(RoleProjectPermission)
    private readonly repository: Repository<RoleProjectPermission>,
    private readonly compilerService: PermissionCompilerService,
  ) {}

  async findAll(): Promise<RoleProjectPermission[]> {
    return this.repository.find({
      relations: {
        role: true,
        project: true,
        module: true,
        subModule: true,
        action: true,
      },
    });
  }

  async findByRole(roleId: number): Promise<RoleProjectPermission[]> {
    return this.repository.find({
      where: { roleId },
      relations: { project: true, module: true, subModule: true, action: true },
    });
  }

  async findByRoleAndProject(
    roleId: number,
    projectId: number,
  ): Promise<RoleProjectPermission[]> {
    return this.repository.find({
      where: { roleId, projectId },
      relations: { module: true, subModule: true, action: true },
    });
  }

  async create(dto: {
    roleId: number;
    projectId: number;
    moduleId: number;
    subModuleId?: number;
    actionId: number;
  }): Promise<RoleProjectPermission> {
    const existing = await this.repository.findOne({
      where: {
        roleId: dto.roleId,
        projectId: dto.projectId,
        moduleId: dto.moduleId,
        subModuleId: dto.subModuleId ?? null,
        actionId: dto.actionId,
      },
    });
    if (existing) {
      throw new ConflictException(
        'Permission already exists for this role/project/module/action',
      );
    }
    const saved = await this.repository.save(this.repository.create(dto));
    await this.compilerService.compileForRole(dto.roleId).catch((err) => this.logger.error('Failed to compile permissions after role-project permission create', err));
    return saved;
  }

  async remove(id: number): Promise<void> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('RoleProjectPermission not found');
    await this.repository.remove(entity);
    await this.compilerService.compileForRole(entity.roleId).catch((err) => this.logger.error('Failed to compile permissions after role-project permission removal', err));
  }
}
