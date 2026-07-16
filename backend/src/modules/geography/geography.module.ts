import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Zone } from './entities/zone.entity';
import { City } from './entities/city.entity';
import { CityZoneMapping } from './entities/city-zone-mapping.entity';
import { ZoneService } from './services/zone.service';
import { CityService } from './services/city.service';
import { CityZoneMappingService } from './services/city-zone-mapping.service';
import { ZoneController } from './controllers/zone.controller';
import { CityController } from './controllers/city.controller';
import { CityZoneMappingController } from './controllers/city-zone-mapping.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Zone, City, CityZoneMapping])],
  controllers: [ZoneController, CityController, CityZoneMappingController],
  providers: [ZoneService, CityService, CityZoneMappingService],
  exports: [TypeOrmModule],
})
export class GeographyModule {}
