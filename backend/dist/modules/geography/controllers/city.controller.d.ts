import { CityService } from '../services/city.service';
import { CreateCityDto, UpdateCityDto } from '../dto/city.dto';
import { City } from '../entities/city.entity';
import { BaseController } from '../../../common/crud/base.controller';
export declare class CityController extends BaseController<City, CreateCityDto, UpdateCityDto> {
    private readonly cityService;
    constructor(cityService: CityService);
}
