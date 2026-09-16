import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LaCity } from './entities/la-city.entity';
import { LaRegion } from './entities/la-region.entity';
import { LaMicromarket } from './entities/la-micromarket.entity';
import { LaLocality } from './entities/la-locality.entity';
import { LaCityApproval } from './entities/la-city-approval.entity';
import { LaCityService } from './services/la-city.service';
import { LaCityController } from './controllers/la-city.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LaCity, LaRegion, LaMicromarket, LaLocality, LaCityApproval])],
  controllers: [LaCityController],
  providers: [LaCityService],
  exports: [LaCityService, TypeOrmModule],
})
export class LaCitiesModule {}
