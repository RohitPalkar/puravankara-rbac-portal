import { ZoneService } from '../services/zone.service';
import { CreateZoneDto, UpdateZoneDto } from '../dto/zone.dto';
import { Zone } from '../entities/zone.entity';
import { BaseController } from '../../../common/crud/base.controller';
export declare class ZoneController extends BaseController<Zone, CreateZoneDto, UpdateZoneDto> {
    private readonly zoneService;
    constructor(zoneService: ZoneService);
}
