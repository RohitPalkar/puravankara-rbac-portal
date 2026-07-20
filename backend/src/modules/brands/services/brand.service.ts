import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../entities/brand.entity';
import { BaseService } from '../../../common/crud/base.service';
import { CreateBrandDto, UpdateBrandDto } from '../dto/brand.dto';

@Injectable()
export class BrandService extends BaseService<Brand> {
  constructor(
    @InjectRepository(Brand)
    readonly repository: Repository<Brand>,
  ) {
    super(repository);
  }

  async create(dto: CreateBrandDto): Promise<Brand> {
    return super.create(dto);
  }

  async update(id: number, dto: UpdateBrandDto): Promise<Brand> {
    return super.update(id, dto);
  }
}
