import {
  Controller,
  Get,
  Put,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiProperty,
} from '@nestjs/swagger';
import { IsArray, IsInt } from 'class-validator';
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
import { RoleActionPermissionService } from '../../permissions/services/role-action-permission.service';

class SetRolePermissionsDto {
  @ApiProperty({ type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  actionIds: number[];
}

@ApiTags('Organization - Departments')
@ApiBearerAuth()
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  @ApiOperation({
    summary: 'List all departments with zones and hierarchy info',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of departments' })
  async findAll(@Query() query: QueryDepartmentDto) {
    return this.departmentService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get department detail with zones and hierarchy levels',
  })
  @ApiResponse({ status: 200, description: 'Department detail found' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.findById(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a department with zone mappings and hierarchy levels',
  })
  @ApiResponse({ status: 201, description: 'Department created' })
  async create(@Body() dto: CreateDepartmentDto) {
    return this.departmentService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update department with zone mappings and hierarchy levels',
  })
  @ApiResponse({ status: 200, description: 'Department updated' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.departmentService.update(id, dto);
  }

  @Get(':id/hierarchy-levels')
  @ApiOperation({ summary: 'Get hierarchy levels for a department' })
  @ApiResponse({ status: 200, description: 'Hierarchy levels found' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async getHierarchyLevels(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.getHierarchyLevels(id);
  }

  @Get(':id/hierarchy-levels/:levelNumber')
  @ApiOperation({ summary: 'Get the role configured for a department + hierarchy level' })
  @ApiResponse({ status: 200, description: 'Role found or null' })
  async getRoleForHierarchyLevel(
    @Param('id', ParseIntPipe) id: number,
    @Param('levelNumber', ParseIntPipe) levelNumber: number,
  ) {
    return this.departmentService.getRoleForHierarchyLevel(id, levelNumber);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete department' })
  @ApiResponse({ status: 200, description: 'Department deleted' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.departmentService.remove(id);
    return { message: 'Department deleted successfully' };
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
  constructor(
    private readonly roleService: RoleService,
    private readonly roleActionPermissionService: RoleActionPermissionService,
  ) {
    super(roleService, 'Role');
  }

  @Get('permissions-summary')
  @ApiOperation({ summary: 'Get all roles with department info and permission counts' })
  async getPermissionsSummary() {
    return this.roleService.getPermissionsSummary();
  }

  @Get(':roleId/permissions')
  @ApiOperation({ summary: 'Get permission action IDs for a role' })
  async getPermissions(@Param('roleId', ParseIntPipe) roleId: number) {
    const actionIds = await this.roleActionPermissionService.findByRole(roleId);
    return { roleId, actionIds };
  }

  @Get(':roleId/permissions/tree')
  @ApiOperation({ summary: 'Get module tree with permission counts for a role' })
  async getPermissionsTree(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.roleActionPermissionService.getTreeWithPermissions(roleId);
  }

  @Put(':roleId/permissions')
  @ApiOperation({ summary: 'Replace all permissions for a role' })
  async setPermissions(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() dto: SetRolePermissionsDto,
  ) {
    await this.roleActionPermissionService.setByRole(roleId, dto.actionIds);
    return { message: 'Permissions updated successfully' };
  }
}
