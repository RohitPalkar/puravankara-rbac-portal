import {
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BaseService } from './base.service';
import { PaginationQueryDto } from '../dto/pagination-query.dto';

export abstract class BaseController<
  TEntity extends { id: number | string; deletedAt?: Date },
  TCreateDto,
  TUpdateDto,
> {
  constructor(
    protected readonly service: BaseService<TEntity>,
    protected readonly entityName: string = 'Resource',
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all resources' })
  @ApiResponse({ status: 200, description: 'Paginated list' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query, ['name']);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get resource by ID' })
  @ApiResponse({ status: 200, description: 'Resource found' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new resource' })
  @ApiResponse({ status: 201, description: 'Resource created' })
  async create(@Body() dto: TCreateDto) {
    return this.service.create(dto as any);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update resource by ID' })
  @ApiResponse({ status: 200, description: 'Resource updated' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: TUpdateDto) {
    return this.service.update(id, dto as any);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete resource' })
  @ApiResponse({ status: 200, description: 'Resource deleted' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { message: 'Resource deleted successfully' };
  }
}
