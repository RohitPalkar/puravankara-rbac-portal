import { Repository } from 'typeorm';
import { City } from '../entities/city.entity';
import { BaseService } from '../../../common/crud/base.service';
import { CreateCityDto, UpdateCityDto } from '../dto/city.dto';
export declare class CityService extends BaseService<City> {
    readonly repository: Repository<City>;
    constructor(repository: Repository<City>);
    create(dto: CreateCityDto): Promise<City>;
    update(id: number, dto: UpdateCityDto): Promise<City>;
}
