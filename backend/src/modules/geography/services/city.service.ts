import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '../entities/city.entity';
import { BaseService } from '../../../common/crud/base.service';
import { CreateCityDto, UpdateCityDto } from '../dto/city.dto';

@Injectable()
export class CityService extends BaseService<City> {
  constructor(
    @InjectRepository(City)
    readonly repository: Repository<City>,
  ) {
    super(repository);
  }

  async create(dto: CreateCityDto): Promise<City> {
    return super.create(dto);
  }

  async update(id: number, dto: UpdateCityDto): Promise<City> {
    return super.update(id, dto);
  }
}
