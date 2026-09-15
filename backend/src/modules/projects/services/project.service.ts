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
    query: PaginationQuery = { page: 1, limit: 20 },
  ): Promise<PaginatedResult<Project>> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      ...filters
    } = query;
    const cappedLimit = Math.min(limit, 100);
    const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';
    const allowedSort = new Set([
      'createdAt',
      'name',
      'id',
      'updatedAt',
      'cityName',
      'phaseName',
    ]);
    const safeSortBy = allowedSort.has(sortBy) ? sortBy : 'createdAt';
    const offset = (page - 1) * cappedLimit;

    const qb = this.repository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.city', 'c')
      .leftJoinAndSelect('p.phase', 'ph')
      .leftJoinAndSelect('ph.brand', 'b')
      .leftJoin('p.projectLocations', 'pl')
      .leftJoin('pl.zone', 'z')
      .addSelect('c.name', 'cityName')
      .addSelect('ph.phaseName', 'phaseName')
      .addSelect('b.brandName', 'brandName')
      .addSelect('z.name', 'zoneName')
      .where('p.deletedAt IS NULL');

    if (search) {
      const escaped = search.replace(/[%_\\]/g, '\\$&');
      qb.andWhere('(p.name ILIKE :search OR c.name ILIKE :search OR ph.phaseName ILIKE :search)', {
        search: `%${escaped}%`,
      });
    }

    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === '' || value === null) continue;
      if (key === 'cityId') qb.andWhere('p.cityId = :cityId', { cityId: value });
      else if (key === 'phaseId') qb.andWhere('p.phaseId = :phaseId', { phaseId: value });
      else if (key === 'brandId') qb.andWhere('b.id = :brandId', { brandId: value });
      else if (key === 'zoneId') qb.andWhere('z.id = :zoneId', { zoneId: value });
    }

    const sortMap: Record<string, string> = {
      createdAt: 'p.createdAt',
      updatedAt: 'p.updatedAt',
      name: 'p.name',
      id: 'p.id',
      cityName: 'c.name',
      phaseName: 'ph.phaseName',
    };
    qb.orderBy(sortMap[safeSortBy] || 'p.createdAt', safeSortOrder);
    qb.skip(offset).take(cappedLimit);

    const [rows, total] = await qb.getManyAndCount();

    return {
      data: rows as any,
      meta: {
        page,
        limit: cappedLimit,
        total,
        totalPages: Math.ceil(total / cappedLimit),
      },
    };
  }

  async findById(id: number | string): Promise<Project> {
    const entity = await this.repository.findOne({
      where: { id } as any,
      relations: {
        paymentGateways: true,
        incentiveRules: true,
        phase: { brand: true },
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
        phase: { brand: true },
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
        phase: { brand: true },
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
