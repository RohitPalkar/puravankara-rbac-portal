import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  DepartmentService,
  RoleService,
} from '../services/organization.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  CreateRoleDto,
  UpdateRoleDto,
} from '../dto/organization.dto';
import { QueryDepartmentDto } from '../dto/query-department.dto';
import { Department } from '../entities/department.entity';
import { Role } from '../entities/role.entity';
import { BaseController } from '../../../common/crud/base.controller';

@ApiTags('Organization - Departments')
@ApiBearerAuth()
@Controller('departments')
export class DepartmentController extends BaseController<
  Department,
  CreateDepartmentDto,
  UpdateDepartmentDto
> {
  constructor(private readonly departmentService: DepartmentService) {
    super(departmentService, 'Department');
  }

  @Get()
  @ApiOperation({ summary: 'List all departments' })
  @ApiResponse({ status: 200, description: 'Paginated list of departments' })
  async findAll(@Query() query: QueryDepartmentDto) {
    return this.departmentService.findAll(query, ['name']);
  }
}

@ApiTags('Organization - Roles')
@ApiBearerAuth()
@Controller('roles')
export class RoleController extends BaseController<
  Role,
  CreateRoleDto,
  UpdateRoleDto
> {
  constructor(private readonly roleService: RoleService) {
    super(roleService, 'Role');
  }
}
