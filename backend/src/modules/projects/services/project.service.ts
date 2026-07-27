import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { ProjectLocation } from '../entities/project-location.entity';
import { ProjectPaymentGateway } from '../entities/project-payment-gateway.entity';
import { ProjectIncentiveRule } from '../entities/project-incentive-rule.entity';
import { CityZoneMapping } from '../../geography/entities/city-zone-mapping.entity';
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
    @InjectRepository(ProjectLocation)
    private readonly projectLocationRepo: Repository<ProjectLocation>,
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
    const {
      page = 1,
      limit = 100,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      ...filters
    } = query;
    const rows = await this.repository.query(
      `SELECT * FROM public.projects WHERE deleted_at IS NULL ORDER BY created_at DESC`,
    );
    return {
      data: rows,
      meta: {
        page,
        limit,
        total: rows.length,
        totalPages: Math.ceil(rows.length / limit),
      },
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

    if (projectData.cityId) {
      const mappings = await this.repository.manager.find(CityZoneMapping, {
        where: { cityId: projectData.cityId },
      });
      if (mappings.length > 0) {
        const locations = mappings.map((m) =>
          this.projectLocationRepo.create({
            projectId: saved.id,
            cityId: projectData.cityId,
            zoneId: m.zoneId,
          }),
        );
        await this.projectLocationRepo.save(locations);
      }
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

    if (projectData.cityId !== undefined) {
      await this.projectLocationRepo.delete({ projectId: id });
      if (projectData.cityId) {
        const mappings = await this.repository.manager.find(CityZoneMapping, {
          where: { cityId: projectData.cityId },
        });
        if (mappings.length > 0) {
          const locations = mappings.map((m) =>
            this.projectLocationRepo.create({
              projectId: id,
              cityId: projectData.cityId,
              zoneId: m.zoneId,
            }),
          );
          await this.projectLocationRepo.save(locations);
        }
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
    project.deletedAt = new Date();
    await this.repository.save(project);
  }
}
