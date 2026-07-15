import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { RoleMappingService } from './role-mapping.service';
import { CreateRoleMappingDto, UpdateRoleMappingDto } from './role-mapping.dto';

@ApiTags('Role Mappings')
@ApiBearerAuth()
@Controller('role-mappings')
export class RoleMappingController {
  constructor(private readonly svc: RoleMappingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a role mapping (role + department + permissions)' })
  async create(@Body() dto: CreateRoleMappingDto) {
    return this.svc.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all role mappings' })
  async findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role mapping detail with full permission tree' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update role mapping metadata and permissions' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleMappingDto,
  ) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a role mapping' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}

@ApiTags('Departments - Roles')
@ApiBearerAuth()
@Controller('departments')
export class DepartmentRolesController {
  constructor(private readonly svc: RoleMappingService) {}

  @Get(':id/roles')
  @ApiOperation({ summary: 'Get roles available for a department' })
  async getRoles(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findRolesByDepartment(id);
  }
}


