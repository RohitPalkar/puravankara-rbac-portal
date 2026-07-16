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
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsArray,
  IsBoolean,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PermissionTemplateService } from './services/permission-template.service';

class ActionPermissionDto {
  @IsInt() @IsNotEmpty() moduleId: number;
  @IsOptional() @IsInt() subModuleId?: number;
  @IsInt() @IsNotEmpty() actionId: number;
}

class SetPermissionsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ActionPermissionDto)
  permissions: ActionPermissionDto[];
}

@ApiTags('Permissions - Templates')
@ApiBearerAuth()
@Controller('permission-templates')
export class PermissionTemplateController {
  constructor(private readonly svc: PermissionTemplateService) {}

  @Get()
  @ApiOperation({ summary: 'List all permission templates' })
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a permission template' })
  create(@Body() dto: { name: string; description?: string }) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a permission template' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { name?: string; description?: string; isActive?: boolean },
  ) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a permission template' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Get permissions for a template' })
  getPermissions(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getPermissions(id);
  }

  @Post(':id/permissions')
  @ApiOperation({ summary: 'Set permissions for a template (replaces all)' })
  setPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetPermissionsDto,
  ) {
    return this.svc.setPermissions(id, dto.permissions);
  }
}
