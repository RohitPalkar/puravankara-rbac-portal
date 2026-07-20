import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { UserPermissionOverride } from '../entities/user-permission-override.entity';
import { PermissionType } from '../../../common/enums';
import { PermissionCompilerService } from './permission-compiler.service';

@Injectable()
export class UserPermissionOverrideService {
  constructor(
    @InjectRepository(UserPermissionOverride)
    readonly repository: Repository<UserPermissionOverride>,
    private readonly compilerService: PermissionCompilerService,
  ) {}

  async findByUser(userId: string): Promise<UserPermissionOverride[]> {
    return this.repository.find({
      where: { userId },
      relations: { module: true, subModule: true, action: true },
    });
  }

  async findByUserAndProject(
    userId: string,
    projectId: number,
  ): Promise<UserPermissionOverride[]> {
    return this.repository.find({
      where: { userId, projectId },
      relations: { module: true, subModule: true, action: true },
    });
  }

  async upsert(dto: {
    userId: string;
    projectId: number;
    moduleId: number;
    subModuleId?: number;
    actionId: number;
    permissionType: 'ALLOW' | 'DENY';
    reason?: string;
  }): Promise<UserPermissionOverride> {
    const existing = await this.repository.findOne({
      where: {
        userId: dto.userId,
        projectId: dto.projectId,
        moduleId: dto.moduleId,
        subModuleId: dto.subModuleId ?? IsNull(),
        actionId: dto.actionId,
      },
    });

    if (existing) {
      existing.permissionType = dto.permissionType as PermissionType;
      existing.reason = dto.reason;
      const saved = await this.repository.save(existing);
      await this.compilerService
        .compileAndSave(dto.userId, dto.projectId)
        .catch(() => {});
      return saved;
    }

    const override = this.repository.create(dto as any);
    const saved = await this.repository.save(override);
    await this.compilerService
      .compileAndSave(dto.userId, dto.projectId)
      .catch(() => {});
    return saved as unknown as Promise<UserPermissionOverride>;
  }

  async remove(id: number): Promise<void> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Override not found');
    const { userId, projectId } = entity;
    await this.repository.delete(id);
    await this.compilerService
      .compileAndSave(userId, projectId)
      .catch(() => {});
  }

  async removeByKey(
    userId: string,
    projectId: number,
    moduleId: number,
    actionId: number,
  ): Promise<void> {
    const result = await this.repository.delete({
      userId,
      projectId,
      moduleId,
      actionId,
    });
    if (result.affected === 0)
      throw new NotFoundException('Override not found');
  }
}
