import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { Phase } from '../entities/phase.entity';
import { BaseService } from '../../../common/crud/base.service';
import { PaginationQuery, PaginatedResult } from '../../../common/crud/crud.interface';
import {
  CreatePhaseDto,
  UpdatePhaseDto,
  UpdateLaunchDto,
} from '../dto/phase.dto';

const PHASE_RELATIONS = ['brand', 'city'] as const;

function flattenBrandCity(phase: Phase): Phase {
  const p = phase as any;
  p.brandName = p.brand?.brandName ?? null;
  p.cityName = p.city?.name ?? null;
  delete p.brand;
  delete p.city;
  return phase;
}

@Injectable()
export class PhaseService extends BaseService<Phase> {
  constructor(
    @InjectRepository(Phase)
    readonly repository: Repository<Phase>,
  ) {
    super(repository);
  }

  async findAll(query: PaginationQuery): Promise<PaginatedResult<Phase>> {
    const {
      page,
      limit,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      ...filters
    } = query;

    const paginate = page !== undefined && limit !== undefined;
    const searchableFields = ['phaseName'];
    const where: FindOptionsWhere<Phase> = { deletedAt: null } as any;

    if (search && searchableFields.length > 0) {
      const searchConditions = searchableFields.map((field) => ({
        [field]: ILike(`%${search}%`),
        ...where,
      })) as FindOptionsWhere<Phase>[];
      delete (where as any).deletedAt;

      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== '' && value !== null) {
          searchConditions.forEach((cond) => {
            (cond as any)[key] = value;
          });
        }
      }

      const [data, total] = await this.repository.findAndCount({
        where: searchConditions,
        relations: PHASE_RELATIONS as any,
        order: { [sortBy]: sortOrder } as any,
        ...(paginate ? { skip: (page - 1) * limit, take: limit } : {}),
      });

      return {
        data: data.map(flattenBrandCity),
        meta: {
          page: paginate ? page : 1,
          limit: paginate ? limit : total,
          total,
          totalPages: paginate ? Math.ceil(total / limit) : 1,
        },
      };
    }

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== '' && value !== null) {
        (where as any)[key] = value;
      }
    }

    const [data, total] = await this.repository.findAndCount({
      where,
      relations: PHASE_RELATIONS as any,
      order: { [sortBy]: sortOrder } as any,
      ...(paginate ? { skip: (page - 1) * limit, take: limit } : {}),
    });

    return {
      data: data.map(flattenBrandCity),
      meta: {
        page: paginate ? page : 1,
        limit: paginate ? limit : total,
        total,
        totalPages: paginate ? Math.ceil(total / limit) : 1,
      },
    };
  }

  async findById(id: number): Promise<Phase> {
    const entity = await this.repository.findOne({
      where: { id } as any,
      relations: PHASE_RELATIONS as any,
    });

    if (!entity || (entity as any).deletedAt) {
      throw new NotFoundException('Phase not found');
    }

    return flattenBrandCity(entity);
  }

  async create(dto: CreatePhaseDto): Promise<Phase> {
    return super.create(dto);
  }

  async update(id: number, dto: UpdatePhaseDto): Promise<Phase> {
    return super.update(id, dto);
  }

  async updateLaunch(id: number, dto: UpdateLaunchDto): Promise<Phase> {
    const phase = await this.repository.findOneOrFail({ where: { id } as any });
    Object.assign(phase, dto);
    return this.repository.save(phase);
  }
}
