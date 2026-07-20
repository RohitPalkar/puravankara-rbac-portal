import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { ProjectService } from '../services/project.service';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';
import { Project } from '../entities/project.entity';
import { PaginatedResult } from '../../../common/crud/crud.interface';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @ApiOperation({ summary: 'Get all projects (paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedResult<Project>> {
    return this.projectService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 100,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID with relations' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Project> {
    return this.projectService.findById(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new project with payment gateways and incentive rules',
  })
  async create(@Body() dto: CreateProjectDto): Promise<Project> {
    return this.projectService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
  ): Promise<Project> {
    return this.projectService.update(id, dto);
  }
}
