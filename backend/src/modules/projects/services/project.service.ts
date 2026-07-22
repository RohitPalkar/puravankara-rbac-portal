import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { ProjectPaymentGateway } from '../entities/project-payment-gateway.entity';
import { ProjectIncentiveRule } from '../entities/project-incentive-rule.entity';
import { BaseService } from '../../../common/crud/base.service';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';
import {
  PaginationQuery,
  PaginatedResult,
} from '../../../common/crud/crud.interface';

@Injectable()
export class ProjectService extends BaseService<Project> {
  constructor(
    @InjectRepository(Project)
    readonly repository: Repository<Project>,
    @InjectRepository(ProjectPaymentGateway)
    private readonly gatewayRepo: Repository<ProjectPaymentGateway>,
    @InjectRepository(ProjectIncentiveRule)
    private readonly incentiveRepo: Repository<ProjectIncentiveRule>,
  ) {
    super(repository);
  }

  async findAll(
    query: PaginationQuery = { page: 1, limit: 100 },
  ): Promise<PaginatedResult<Project>> {
    const { page = 1, limit = 100, search, sortBy = 'createdAt', sortOrder = 'DESC', ...filters } = query;
    const qb = this.repository.createQueryBuilder('project')
      .leftJoinAndSelect('project.brand', 'brand')
      .leftJoinAndSelect('project.city', 'city')
      .where('project.deleted_at IS NULL');

    if (search) {
      qb.andWhere(
        '(project.name ILIKE :search OR project.sfdc_project_name ILIKE :search OR project.codename ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (filters.isActive !== undefined) {
      qb.andWhere('project.is_active = :isActive', { isActive: filters.isActive });
    }

    const sortMap: Record<string, string> = {
      name: 'project.name',
      createdAt: 'project.created_at',
      updatedAt: 'project.updated_at',
    };
    const orderCol = sortMap[sortBy] || 'project.created_at';
    qb.orderBy(orderCol, sortOrder);

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number | string): Promise<Project> {
    const entity = await this.repository.findOne({
      where: { id } as any,
      relations: {
        paymentGateways: true,
        incentiveRules: true,
        brand: true,
        city: true,
      },
    });

    if (!entity || entity.deletedAt) {
      throw new NotFoundException('Project not found');
    }

    return entity;
  }

  async create(dto: any): Promise<Project> {
    const { paymentGateways, incentiveRules, ...projectData } =
      dto as CreateProjectDto;
    const project = this.repository.create(projectData);
    const saved = await this.repository.save(project);

    if (paymentGateways?.length) {
      const gateways = paymentGateways.map((g) =>
        this.gatewayRepo.create({ ...g, projectId: saved.id }),
      );
      await this.gatewayRepo.save(gateways);
    }

    if (incentiveRules?.length) {
      const rules = incentiveRules.map((r) =>
        this.incentiveRepo.create({ ...r, projectId: saved.id }),
      );
      await this.incentiveRepo.save(rules);
    }

    return this.repository.findOne({
      where: { id: saved.id },
      relations: {
        paymentGateways: true,
        incentiveRules: true,
        brand: true,
        city: true,
      },
    });
  }

  async update(id: number, dto: any): Promise<Project> {
    const { paymentGateways, incentiveRules, ...projectData } =
      dto as UpdateProjectDto;

    if (Object.keys(projectData).length) {
      await super.update(id, projectData);
    }

    if (paymentGateways) {
      await this.gatewayRepo.delete({ projectId: id });
      if (paymentGateways.length) {
        const gateways = paymentGateways.map((g) =>
          this.gatewayRepo.create({ ...g, projectId: id }),
        );
        await this.gatewayRepo.save(gateways);
      }
    }

    if (incentiveRules) {
      await this.incentiveRepo.delete({ projectId: id });
      if (incentiveRules.length) {
        const rules = incentiveRules.map((r) =>
          this.incentiveRepo.create({ ...r, projectId: id }),
        );
        await this.incentiveRepo.save(rules);
      }
    }

    return this.repository.findOne({
      where: { id },
      relations: {
        paymentGateways: true,
        incentiveRules: true,
        brand: true,
        city: true,
      },
    });
  }

  async remove(id: number): Promise<void> {
    const project = await this.findById(id);
    project.deletedAt = new Date() as any;
    await this.repository.save(project);
  }
}
