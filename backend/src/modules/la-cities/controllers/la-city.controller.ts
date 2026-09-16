import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LaCityService } from '../services/la-city.service';
import { CreateLaCityDto, UpdateLaCityDto } from '../dto/la-city.dto';
import { QueryLaCityDto } from '../dto/query-la-city.dto';

@ApiTags('LA Cities')
@ApiBearerAuth()
@Controller('la-cities')
export class LaCityController {
  constructor(private readonly laCityService: LaCityService) {}

  @Get()
  @ApiOperation({ summary: 'List LA Cities (paginated, with geo counts)' })
  @ApiResponse({ status: 200, description: 'Paginated list' })
  async findAll(@Query() query: QueryLaCityDto) {
    return this.laCityService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get LA City by ID with regions, micromarkets, localities, approvals' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.laCityService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create LA City with geo mapping and approvals' })
  @ApiResponse({ status: 201, description: 'LA City created' })
  async create(@Body() dto: CreateLaCityDto) {
    return this.laCityService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update LA City' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLaCityDto) {
    return this.laCityService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete LA City' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.laCityService.remove(id);
  }
}
