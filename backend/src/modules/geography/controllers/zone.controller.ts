import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZoneService } from '../services/zone.service';
import { CreateZoneDto, UpdateZoneDto } from '../dto/zone.dto';
import { Zone } from '../entities/zone.entity';
import { BaseController } from '../../../common/crud/base.controller';

@ApiTags('Geography - Zones')
@ApiBearerAuth()
@Controller('zones')
export class ZoneController extends BaseController<
  Zone,
  CreateZoneDto,
  UpdateZoneDto
> {
  constructor(private readonly zoneService: ZoneService) {
    super(zoneService, 'Zone');
  }
}
