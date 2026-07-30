import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { ChannelPartner } from '../entities/channel-partner.entity';
import { BaseService } from '../../../common/crud/base.service';
import { PaginationQuery, PaginatedResult } from '../../../common/crud/crud.interface';
import {
  CreateChannelPartnerDto,
  UpdateChannelPartnerDto,
} from '../dto/channel-partner.dto';

const CP_RELATIONS = { cpType: true };

function flattenCpType(cp: ChannelPartner): ChannelPartner {
  const c = cp as any;
  c.cpTypeName = c.cpType?.name ?? null;
  delete c.cpType;
  return cp;
}

@Injectable()
export class ChannelPartnerService extends BaseService<ChannelPartner> {
  constructor(
    @InjectRepository(ChannelPartner)
    readonly repository: Repository<ChannelPartner>,
  ) {
    super(repository);
  }

  async findAll(query: PaginationQuery): Promise<PaginatedResult<ChannelPartner>> {
    const {
      page,
      limit,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      ...filters
    } = query;

    const paginate = page !== undefined && limit !== undefined;
    const searchableFields = ['cpName'];
    const where: FindOptionsWhere<ChannelPartner> = { deletedAt: null } as any;

    if (search && searchableFields.length > 0) {
      const searchConditions = searchableFields.map((field) => ({
        [field]: ILike(`%${search}%`),
        ...where,
      })) as FindOptionsWhere<ChannelPartner>[];
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
        relations: CP_RELATIONS,
        order: { [sortBy]: sortOrder } as any,
        ...(paginate ? { skip: (page - 1) * limit, take: limit } : {}),
      });

      return {
        data: data.map(flattenCpType),
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
      relations: CP_RELATIONS,
      order: { [sortBy]: sortOrder } as any,
      ...(paginate ? { skip: (page - 1) * limit, take: limit } : {}),
    });

    return {
      data: data.map(flattenCpType),
      meta: {
        page: paginate ? page : 1,
        limit: paginate ? limit : total,
        total,
        totalPages: paginate ? Math.ceil(total / limit) : 1,
      },
    };
  }

  async findById(id: number): Promise<ChannelPartner> {
    const entity = await this.repository.findOne({
      where: { id } as any,
      relations: CP_RELATIONS,
    });

    if (!entity || (entity as any).deletedAt) {
      throw new NotFoundException('Channel partner not found');
    }

    return flattenCpType(entity);
  }

  async create(dto: CreateChannelPartnerDto): Promise<ChannelPartner> {
    const entity = await super.create(dto);
    return this.findById(entity.id);
  }

  async update(
    id: number,
    dto: UpdateChannelPartnerDto,
  ): Promise<ChannelPartner> {
    const entity = await super.update(id, dto);
    return this.findById(entity.id);
  }
}
