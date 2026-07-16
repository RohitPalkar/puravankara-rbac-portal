import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zone } from '../entities/zone.entity';
import { BaseService } from '../../../common/crud/base.service';
import { CreateZoneDto, UpdateZoneDto } from '../dto/zone.dto';

@Injectable()
export class ZoneService extends BaseService<Zone> {
  constructor(
    @InjectRepository(Zone)
    readonly repository: Repository<Zone>,
  ) {
    super(repository);
  }

  async create(dto: CreateZoneDto): Promise<Zone> {
    return super.create(dto);
  }

  async update(id: number, dto: UpdateZoneDto): Promise<Zone> {
    return super.update(id, dto);
  }
}
