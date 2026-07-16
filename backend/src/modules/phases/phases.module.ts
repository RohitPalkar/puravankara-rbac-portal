import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Phase } from './entities/phase.entity';
import { PhaseService } from './services/phase.service';
import { PhaseController } from './controllers/phase.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Phase])],
  controllers: [PhaseController],
  providers: [PhaseService],
  exports: [TypeOrmModule],
})
export class PhasesModule {}
