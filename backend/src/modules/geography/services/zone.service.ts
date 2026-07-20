import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zone } from '../entities/zone.entity';
import { CityZoneMapping } from '../entities/city-zone-mapping.entity';
import { BaseService } from '../../../common/crud/base.service';
import { PaginationQuery } from '../../../common/crud/crud.interface';

@Injectable()
export class ZoneService extends BaseService<Zone> {
  constructor(
    @InjectRepository(Zone)
    readonly repository: Repository<Zone>,
    @InjectRepository(CityZoneMapping)
    private readonly mappingRepo: Repository<CityZoneMapping>,
  ) {
    super(repository);
  }

  async findAll(query: PaginationQuery): Promise<any> {
    const result = await super.findAll(query, ['name']);
    const data = await Promise.all(
      result.data.map((zone) => this.enhanceZone(zone)),
    );
    return { ...result, data };
  }

  async findById(id: number): Promise<any> {
    const zone = await super.findById(id);
    return this.enhanceZone(zone);
  }

  private async enhanceZone(zone: Zone) {
    const citiesMapped = await this.mappingRepo.count({
      where: { zoneId: zone.id },
    });
    const salaryCapping = Number(zone.salaryCapping);
    const label =
      salaryCapping % 1 === 0
        ? `${Math.floor(salaryCapping)}x`
        : `${salaryCapping}x`;
    return {
      ...zone,
      salaryCapping,
      salaryCappingLabel: label,
      citiesMapped,
    };
  }
}
