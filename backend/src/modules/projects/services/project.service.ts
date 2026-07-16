import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { ProjectPaymentGateway } from '../entities/project-payment-gateway.entity';
import { ProjectIncentiveRule } from '../entities/project-incentive-rule.entity';
import { BaseService } from '../../../common/crud/base.service';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';
import { PaginationQuery, PaginatedResult } from '../../../common/crud/crud.interface';

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

  async create(dto: any): Promise<Project> {
    const { paymentGateways, incentiveRules, ...projectData } = dto as CreateProjectDto;
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
      where: { id: saved.id } as any,
      relations: { paymentGateways: true, incentiveRules: true, brand: true, city: true },
    });
  }

  async update(id: number, dto: any): Promise<Project> {
    const { paymentGateways, incentiveRules, ...projectData } = dto as UpdateProjectDto;

    if (Object.keys(projectData).length) {
      await super.update(id, projectData);
    }

    if (paymentGateways) {
      await this.gatewayRepo.delete({ projectId: id } as any);
      if (paymentGateways.length) {
        const gateways = paymentGateways.map((g) =>
          this.gatewayRepo.create({ ...g, projectId: id }),
        );
        await this.gatewayRepo.save(gateways);
      }
    }

    if (incentiveRules) {
      await this.incentiveRepo.delete({ projectId: id } as any);
      if (incentiveRules.length) {
        const rules = incentiveRules.map((r) =>
          this.incentiveRepo.create({ ...r, projectId: id }),
        );
        await this.incentiveRepo.save(rules);
      }
    }

    return this.repository.findOne({
      where: { id } as any,
      relations: { paymentGateways: true, incentiveRules: true, brand: true, city: true },
    });
  }

  async findAll(
    query: PaginationQuery = { page: 1, limit: 100 },
    searchableFields: string[] = [],
    defaultSort: string = 'createdAt',
  ): Promise<PaginatedResult<Project>> {
    const { page = 1, limit = 100 } = query;
    const [data, total] = await this.repository.findAndCount({
      relations: { brand: true, city: true },
      order: { [defaultSort]: 'DESC' } as any,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number | string): Promise<Project> {
    const entity = await this.repository.findOne({
      where: { id } as any,
      relations: { paymentGateways: true, incentiveRules: true, brand: true, city: true },
    });

    if (!entity || (entity as any).deletedAt) {
      throw new NotFoundException('Project not found');
    }

    return entity;
  }
}
