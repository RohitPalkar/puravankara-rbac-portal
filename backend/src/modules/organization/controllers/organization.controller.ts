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
import { IsArray, IsInt, IsOptional } from 'class-validator';
import {
  DepartmentService,
  RoleService,
} from '../services/organization.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  CreateRoleDto,
  UpdateRoleDto,
  RemoveRoleDto,
  AssignDepartmentAdminDto,
} from '../dto/organization.dto';
import { QueryDepartmentDto } from '../dto/query-department.dto';
import { Department } from '../entities/department.entity';
import { Role } from '../entities/role.entity';
import { BaseController } from '../../../common/crud/base.controller';
import { RoleActionPermissionService } from '../../permissions/services/role-action-permission.service';
import { RoleMigrationService } from '../services/role-migration.service';

class SetRolePermissionsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  zoneId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  departmentId?: number;

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

  @Get('stats')
  @ApiOperation({ summary: 'Get department summary stats for KPI cards' })
  @ApiResponse({ status: 200, description: 'Department stats' })
  async getStats() {
    return this.departmentService.getStats();
  }

  @Get(':id/delete-impact')
  @ApiOperation({ summary: 'Get impact analysis before deleting a department' })
  @ApiResponse({ status: 200, description: 'Impact analysis' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async getDeleteImpact(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.getDeleteImpact(id);
  }

  @Get('check-name')
  @ApiOperation({ summary: 'Check if a department name is available in a zone' })
  @ApiResponse({ status: 200, description: 'Availability result' })
  async checkName(
    @Query('name') name: string,
    @Query('zoneId', ParseIntPipe) zoneId: number,
    @Query('excludeId') excludeId?: string,
  ) {
    return this.departmentService.checkName(
      name,
      zoneId,
      excludeId ? Number(excludeId) : undefined,
    );
  }

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
  @ApiOperation({
    summary: 'Get the role configured for a department + hierarchy level',
  })
  @ApiResponse({ status: 200, description: 'Role found or null' })
  async getRoleForHierarchyLevel(
    @Param('id', ParseIntPipe) id: number,
    @Param('levelNumber', ParseIntPipe) levelNumber: number,
  ) {
    return this.departmentService.getRoleForHierarchyLevel(id, levelNumber);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete department, optionally merging into another' })
  @ApiResponse({ status: 200, description: 'Department deleted/merged' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('mergeTo') mergeTo?: string,
  ) {
    if (mergeTo) {
      return this.departmentService.removeWithMerge(
        id,
        Number(mergeTo),
      );
    }
    await this.departmentService.remove(id);
    return { message: 'Department deleted successfully' };
  }

  @Put(':id/admin')
  @ApiOperation({ summary: 'Assign a user as department administrator' })
  @ApiResponse({ status: 200, description: 'Department admin assigned' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async assignAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignDepartmentAdminDto,
  ) {
    return this.departmentService.assignDepartmentAdmin(id, dto.userId);
  }

  @Delete(':id/admin')
  @ApiOperation({ summary: 'Remove the department administrator' })
  @ApiResponse({ status: 200, description: 'Department admin removed' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async removeAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.removeDepartmentAdmin(id);
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
    private readonly roleMigrationService: RoleMigrationService,
  ) {
    super(roleService, 'Role');
  }

  @Get('permissions-summary')
  @ApiOperation({
    summary: 'Get all roles with department info and permission counts',
  })
  async getPermissionsSummary() {
    return this.roleService.getPermissionsSummary();
  }

  @Get(':roleId/permissions')
  @ApiOperation({ summary: 'Get permission action IDs for a role' })
  async getPermissions(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Query('zoneId') zoneId?: number,
    @Query('departmentId') departmentId?: number,
  ) {
    const actionIds = await this.roleActionPermissionService.findByRole(
      roleId,
      zoneId ? Number(zoneId) : undefined,
      departmentId ? Number(departmentId) : undefined,
    );
    return { roleId, actionIds };
  }

  @Get(':roleId/permissions/tree')
  @ApiOperation({
    summary: 'Get module tree with permission counts for a role',
  })
  async getPermissionsTree(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Query('zoneId') zoneId?: number,
    @Query('departmentId') departmentId?: number,
  ) {
    return this.roleActionPermissionService.getTreeWithPermissions(
      roleId,
      zoneId ? Number(zoneId) : undefined,
      departmentId ? Number(departmentId) : undefined,
    );
  }

  @Put(':roleId/permissions')
  @ApiOperation({ summary: 'Replace all permissions for a role' })
  async setPermissions(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() dto: SetRolePermissionsDto,
  ) {
    await this.roleActionPermissionService.setByRole(
      roleId,
      dto.actionIds,
      dto.zoneId,
      dto.departmentId,
    );
    return { message: 'Permissions updated successfully' };
  }

  @Post(':id/remove')
  @ApiOperation({
    summary: 'Remove a role with merge or replace migration',
    description:
      'MERGE: combine permissions and users into destination role. REPLACE: reassign users only.',
  })
  async removeWithMigration(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RemoveRoleDto,
  ) {
    return this.roleMigrationService.remove(id, dto);
  }

  @Get(':id/remove/check')
  @ApiOperation({
    summary: 'Check if role can be auto-merged (has no dependencies)',
  })
  async checkRemove(@Param('id', ParseIntPipe) id: number) {
    return this.roleMigrationService.checkAutoMerge(id);
  }

  @Get(':id/remove/dependencies')
  @ApiOperation({
    summary: 'Get dependency counts for a role',
  })
  async getRemoveDependencies(@Param('id', ParseIntPipe) id: number) {
    return this.roleMigrationService.getDependencyCounts(id);
  }
}
