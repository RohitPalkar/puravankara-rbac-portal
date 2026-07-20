import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { RoleProjectPermissionService } from './services/role-project-permission.service';
import { RequirePermission } from './decorators/require-permission.decorator';

class CreateRoleProjectPermissionDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  roleId: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  projectId: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  moduleId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  subModuleId?: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  actionId: number;
}

@ApiTags('Permissions - Role Project')
@ApiBearerAuth()
@Controller('role-project-permissions')
export class RoleProjectPermissionController {
  constructor(private readonly svc: RoleProjectPermissionService) {}

  @Get()
  @ApiOperation({ summary: 'List all role-project permissions' })
  findAll() {
    return this.svc.findAll();
  }

  @Get('role/:roleId')
  @ApiOperation({ summary: 'Get permissions for a role' })
  findByRole(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.svc.findByRole(roleId);
  }

  @Get('role/:roleId/project/:projectId')
  @ApiOperation({ summary: 'Get permissions for a role in a project' })
  findByRoleAndProject(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    return this.svc.findByRoleAndProject(roleId, projectId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a role-project permission' })
  @RequirePermission({ module: 'PERMISSION', action: 'CREATE' })
  create(@Body() dto: CreateRoleProjectPermissionDto) {
    return this.svc.create(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a role-project permission' })
  @RequirePermission({ module: 'PERMISSION', action: 'DELETE' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
