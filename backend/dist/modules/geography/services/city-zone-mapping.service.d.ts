import { Repository } from 'typeorm';
import { CityZoneMapping } from '../entities/city-zone-mapping.entity';
export declare class CityZoneMappingService {
    readonly repository: Repository<CityZoneMapping>;
    constructor(repository: Repository<CityZoneMapping>);
    findAll(): Promise<CityZoneMapping[]>;
    create(dto: {
        cityId: number;
        zoneId: number;
    }): Promise<CityZoneMapping>;
    remove(cityId: number, zoneId: number): Promise<void>;
}
