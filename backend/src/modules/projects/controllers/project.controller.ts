import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { ProjectService } from '../services/project.service';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';
import { QueryProjectDto } from '../dto/query-project.dto';
import { Project } from '../entities/project.entity';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @ApiOperation({ summary: 'Get all projects (paginated)' })
  async findAll(
    @Query() query: QueryProjectDto,
  ) {
    return this.projectService.findAll(query);
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

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete project' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.projectService.remove(id);
  }
}
