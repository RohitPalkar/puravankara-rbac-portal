import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { PermissionTemplate } from '../entities/permission-template.entity';
import { TemplatePermission } from '../entities/template-permission.entity';

@Injectable()
export class PermissionTemplateService {
  constructor(
    @InjectRepository(PermissionTemplate)
    readonly repo: Repository<PermissionTemplate>,
    @InjectRepository(TemplatePermission)
    readonly tpRepo: Repository<TemplatePermission>,
  ) {}

  async findAll(): Promise<PermissionTemplate[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: number): Promise<PermissionTemplate> {
    const tmpl = await this.repo.findOne({ where: { id } });
    if (!tmpl) throw new NotFoundException('Template not found');
    return tmpl;
  }

  async create(dto: {
    name: string;
    description?: string;
  }): Promise<PermissionTemplate> {
    const existing = await this.repo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Template name already exists');
    const tmpl = this.repo.create({
      name: dto.name,
      description: dto.description,
    });
    return this.repo.save(tmpl);
  }

  async update(
    id: number,
    dto: { name?: string; description?: string; isActive?: boolean },
  ): Promise<PermissionTemplate> {
    const tmpl = await this.findById(id);
    if (dto.name && dto.name !== tmpl.name) {
      const existing = await this.repo.findOne({ where: { name: dto.name } });
      if (existing) throw new ConflictException('Template name already exists');
    }
    Object.assign(tmpl, dto);
    return this.repo.save(tmpl);
  }

  async remove(id: number): Promise<void> {
    const tmpl = await this.findById(id);
    await this.tpRepo.delete({ templateId: id });
    await this.repo.remove(tmpl);
  }

  async getPermissions(templateId: number): Promise<TemplatePermission[]> {
    return this.tpRepo.find({
      where: { templateId },
      relations: { module: true, subModule: true, action: true },
    });
  }

  async setPermissions(
    templateId: number,
    permissions: { moduleId: number; subModuleId?: number; actionId: number }[],
  ): Promise<TemplatePermission[]> {
    await this.tpRepo.delete({ templateId });

    if (permissions.length === 0) return [];

    const entities = permissions.map((p) =>
      this.tpRepo.create({
        templateId,
        moduleId: p.moduleId,
        subModuleId: p.subModuleId ?? null,
        actionId: p.actionId,
      }),
    );
    return this.tpRepo.save(entities);
  }
}
