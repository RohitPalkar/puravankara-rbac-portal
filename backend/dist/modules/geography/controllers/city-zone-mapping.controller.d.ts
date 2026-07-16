import { CityZoneMappingService } from '../services/city-zone-mapping.service';
declare class CityZoneMappingDto {
    cityId: number;
    zoneId: number;
}
export declare class CityZoneMappingController {
    private readonly svc;
    constructor(svc: CityZoneMappingService);
    findAll(): Promise<import("../entities/city-zone-mapping.entity").CityZoneMapping[]>;
    create(dto: CityZoneMappingDto): Promise<import("../entities/city-zone-mapping.entity").CityZoneMapping>;
    remove(cityId: string, zoneId: string): Promise<{
        message: string;
    }>;
}
export {};
