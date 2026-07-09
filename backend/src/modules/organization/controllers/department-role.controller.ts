import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { DepartmentRoleService } from '../services/department-role.service';
import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class DepartmentRoleDto {
  @ApiProperty() @IsInt() @IsNotEmpty() departmentId: number;
  @ApiProperty() @IsInt() @IsNotEmpty() roleId: number;
}

@ApiTags('Organization - Department Roles')
@ApiBearerAuth()
@Controller('department-roles')
export class DepartmentRoleController {
  constructor(private readonly svc: DepartmentRoleService) {}

  @Get()
  @ApiOperation({ summary: 'List all department-role mappings' })
  async findAll() {
    return this.svc.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create department-role mapping' })
  async create(@Body() dto: DepartmentRoleDto) {
    return this.svc.create(dto);
  }

  @Delete(':departmentId/role/:roleId')
  @ApiOperation({ summary: 'Delete department-role mapping' })
  async remove(
    @Param('departmentId') departmentId: string,
    @Param('roleId') roleId: string,
  ) {
    await this.svc.remove(+departmentId, +roleId);
    return { message: 'Mapping deleted' };
  }
}
