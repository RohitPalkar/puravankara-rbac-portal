import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandConsultant } from './entities/land-consultant.entity';
import { LandConsultantService } from './services/land-consultant.service';
import { LandConsultantController } from './controllers/land-consultant.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LandConsultant])],
  controllers: [LandConsultantController],
  providers: [LandConsultantService],
  exports: [LandConsultantService, TypeOrmModule],
})
export class LandConsultantsModule {}
