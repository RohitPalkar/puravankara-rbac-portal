import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PaginationQuery, PaginatedResult } from './crud.interface';

export abstract class BaseService<
  T extends { id: number | string; deletedAt?: Date | null },
> {
  constructor(protected readonly repository: Repository<T>) {}

  async findAll(
    query: PaginationQuery,
    searchableFields: string[] = [],
    defaultSort: string = 'createdAt',
  ): Promise<PaginatedResult<T>> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = defaultSort,
      sortOrder = 'DESC',
      ...filters
    } = query;

    const where: FindOptionsWhere<T> = { deletedAt: null };

    if (search && searchableFields.length > 0) {
      const searchConditions = searchableFields.map((field) => ({
        [field]: ILike(`%${search}%`),
        ...where,
      })) as FindOptionsWhere<T>[];
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
        order: { [sortBy]: sortOrder } as any,
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        data,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
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
      order: { [sortBy]: sortOrder } as any,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number | string): Promise<T> {
    const entity = await this.repository.findOne({
      where: { id } as any,
    });

    if (!entity || (entity as any).deletedAt) {
      throw new NotFoundException('Resource not found');
    }

    return entity;
  }

  async create(dto: Partial<T>): Promise<T> {
    const entity = this.repository.create(dto as any);
    return this.repository.save(entity as any);
  }

  async update(id: number | string, dto: Partial<T>): Promise<T> {
    const entity = await this.findById(id);
    Object.assign(entity, dto);
    return this.repository.save(entity);
  }

  async remove(id: number | string): Promise<void> {
    const entity = await this.findById(id);
    (entity as any).deletedAt = new Date();
    await this.repository.save(entity);
  }
}
