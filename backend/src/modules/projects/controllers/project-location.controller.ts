import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProjectLocationService } from '../services/project-location.service';
import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class ProjectLocationDto {
  @ApiProperty() @IsInt() @IsNotEmpty() projectId: number;
  @ApiProperty() @IsInt() @IsNotEmpty() cityId: number;
  @ApiProperty() @IsInt() @IsNotEmpty() zoneId: number;
}

@ApiTags('Projects - Locations')
@ApiBearerAuth()
@Controller('project-locations')
export class ProjectLocationController {
  constructor(private readonly svc: ProjectLocationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all project locations' })
  async findAll() {
    return this.svc.findAll();
  }

  @Get('zone/:zoneId')
  @ApiOperation({ summary: 'Get project locations by zone' })
  async findByZone(@Param('zoneId') zoneId: string) {
    return this.svc.findByZone(+zoneId);
  }

  @Get(':projectId')
  @ApiOperation({ summary: 'Get locations for a project' })
  async findByProject(@Param('projectId') projectId: string) {
    return this.svc.findByProject(+projectId);
  }

  @Post()
  @ApiOperation({ summary: 'Add location to project' })
  async create(@Body() dto: ProjectLocationDto) {
    return this.svc.create(dto);
  }

  @Delete(':projectId/city/:cityId/zone/:zoneId')
  @ApiOperation({ summary: 'Remove location from project' })
  async remove(
    @Param('projectId') projectId: string,
    @Param('cityId') cityId: string,
    @Param('zoneId') zoneId: string,
  ) {
    await this.svc.remove(+projectId, +cityId, +zoneId);
    return { message: 'Project location removed' };
  }
}
