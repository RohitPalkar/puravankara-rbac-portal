import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../entities/brand.entity';
import { BaseService } from '../../../common/crud/base.service';

@Injectable()
export class BrandService extends BaseService<Brand> {
  constructor(
    @InjectRepository(Brand)
    readonly repository: Repository<Brand>,
  ) {
    super(repository);
  }

  async findAll(
    query: any,
    searchableFields: string[] = [],
  ): Promise<{ data: Brand[]; meta: any }> {
    const result = await super.findAll(query, searchableFields);
    if (result.data.length > 0) {
      const ids = result.data.map((b) => b.id);
      const loaded = await this.repository
        .createQueryBuilder('brand')
        .leftJoinAndSelect('brand.cityRef', 'city')
        .where('brand.id IN (:...ids)', { ids })
        .getMany();
      const map = new Map(loaded.map((b) => [b.id, b]));
      result.data = result.data.map((b) => map.get(b.id) ?? b);
    }
    return result;
  }

  async findById(id: number): Promise<Brand> {
    const brand = await super.findById(id);
    const loaded = await this.repository
      .createQueryBuilder('brand')
      .leftJoinAndSelect('brand.cityRef', 'city')
      .where('brand.id = :id', { id: brand.id })
      .getOne();
    return loaded ?? brand;
  }
}
