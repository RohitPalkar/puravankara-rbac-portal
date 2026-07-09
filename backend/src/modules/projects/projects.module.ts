import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectLocation } from './entities/project-location.entity';
import { ProjectService } from './services/project.service';
import { ProjectLocationService } from './services/project-location.service';
import { ProjectController } from './controllers/project.controller';
import { ProjectLocationController } from './controllers/project-location.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectLocation])],
  controllers: [ProjectController, ProjectLocationController],
  providers: [ProjectService, ProjectLocationService],
  exports: [TypeOrmModule],
})
export class ProjectsModule {}
