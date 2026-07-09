import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
  Optional,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RoleMappingService } from './role-mapping.service';
import { CreateRoleMappingDto } from './role-mapping.dto';

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

@ApiTags('Users - Available Roles')
@ApiBearerAuth()
@Controller('users')
export class UserAvailableRolesController {
  constructor(private readonly svc: RoleMappingService) {}

  @Get('available-secondary-roles')
  @ApiOperation({ summary: 'Get roles eligible for secondary assignment' })
  @ApiQuery({
    name: 'exclude',
    required: false,
    type: Number,
    description: 'Primary role ID to exclude',
  })
  async getSecondaryRoles(@Query('exclude') exclude?: string) {
    const excludeId = exclude ? parseInt(exclude, 10) : undefined;
    return this.svc.findAvailableSecondaryRoles(excludeId);
  }
}
