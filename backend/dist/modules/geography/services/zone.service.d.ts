import { Repository } from 'typeorm';
import { Zone } from '../entities/zone.entity';
import { BaseService } from '../../../common/crud/base.service';
import { CreateZoneDto, UpdateZoneDto } from '../dto/zone.dto';
export declare class ZoneService extends BaseService<Zone> {
    readonly repository: Repository<Zone>;
    constructor(repository: Repository<Zone>);
    create(dto: CreateZoneDto): Promise<Zone>;
    update(id: number, dto: UpdateZoneDto): Promise<Zone>;
}
