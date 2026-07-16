import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CityService } from '../services/city.service';
import { CreateCityDto, UpdateCityDto } from '../dto/city.dto';
import { City } from '../entities/city.entity';
import { BaseController } from '../../../common/crud/base.controller';

@ApiTags('Geography - Cities')
@ApiBearerAuth()
@Controller('cities')
export class CityController extends BaseController<
  City,
  CreateCityDto,
  UpdateCityDto
> {
  constructor(private readonly cityService: CityService) {
    super(cityService, 'City');
  }
}
