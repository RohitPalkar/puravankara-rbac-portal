import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
