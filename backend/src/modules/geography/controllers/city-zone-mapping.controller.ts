import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CityZoneMappingService } from '../services/city-zone-mapping.service';
import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class CityZoneMappingDto {
  @ApiProperty() @IsInt() @IsNotEmpty() cityId: number;
  @ApiProperty() @IsInt() @IsNotEmpty() zoneId: number;
}

@ApiTags('Geography - City Zone Mappings')
@ApiBearerAuth()
@Controller('city-zone-mappings')
export class CityZoneMappingController {
  constructor(private readonly svc: CityZoneMappingService) {}

  @Get()
  @ApiOperation({ summary: 'List all city-zone mappings' })
  async findAll() {
    return this.svc.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a city-zone mapping' })
  async create(@Body() dto: CityZoneMappingDto) {
    return this.svc.create(dto);
  }

  @Delete(':cityId/zone/:zoneId')
  @ApiOperation({ summary: 'Delete a city-zone mapping' })
  async remove(
    @Param('cityId') cityId: string,
    @Param('zoneId') zoneId: string,
  ) {
    await this.svc.remove(+cityId, +zoneId);
    return { message: 'Mapping deleted' };
  }
}
