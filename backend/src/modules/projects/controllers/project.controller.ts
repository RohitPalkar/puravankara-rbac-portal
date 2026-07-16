import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProjectService } from '../services/project.service';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';
import { Project } from '../entities/project.entity';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  async findAll(): Promise<Project[]> {
    return this.projectService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Project> {
    return this.projectService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new project with payment gateways and incentive rules' })
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
