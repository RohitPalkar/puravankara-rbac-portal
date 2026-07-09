import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CityZoneMapping } from '../entities/city-zone-mapping.entity';

@Injectable()
export class CityZoneMappingService {
  constructor(
    @InjectRepository(CityZoneMapping)
    readonly repository: Repository<CityZoneMapping>,
  ) {}

  async findAll(): Promise<CityZoneMapping[]> {
    return this.repository.find({ relations: { city: true, zone: true } });
  }

  async create(dto: {
    cityId: number;
    zoneId: number;
  }): Promise<CityZoneMapping> {
    const existing = await this.repository.findOne({
      where: { cityId: dto.cityId, zoneId: dto.zoneId },
    });
    if (existing) throw new ConflictException('Mapping already exists');
    const mapping = this.repository.create(dto);
    return this.repository.save(mapping);
  }

  async remove(cityId: number, zoneId: number): Promise<void> {
    const result = await this.repository.delete({ cityId, zoneId });
    if (result.affected === 0) throw new NotFoundException('Mapping not found');
  }
}
