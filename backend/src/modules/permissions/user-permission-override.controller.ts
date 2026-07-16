import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { UserPermissionOverrideService } from './services/user-permission-override.service';
import { PermissionType } from '../../common/enums';

class CreateOverrideDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsInt()
  @IsNotEmpty()
  projectId: number;

  @IsInt()
  @IsNotEmpty()
  moduleId: number;

  @IsOptional()
  @IsInt()
  subModuleId?: number;

  @IsInt()
  @IsNotEmpty()
  actionId: number;

  @IsEnum(PermissionType)
  permissionType: PermissionType;

  @IsOptional()
  @IsString()
  reason?: string;
}

@ApiTags('Permissions - User Overrides')
@ApiBearerAuth()
@Controller('user-permission-overrides')
export class UserPermissionOverrideController {
  constructor(private readonly svc: UserPermissionOverrideService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get permission overrides for a user' })
  findByUser(@Param('userId') userId: string) {
    return this.svc.findByUser(userId);
  }

  @Get(':userId/project/:projectId')
  @ApiOperation({ summary: 'Get permission overrides for a user in a project' })
  findByUserAndProject(
    @Param('userId') userId: string,
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    return this.svc.findByUserAndProject(userId, projectId);
  }

  @Post()
  @ApiOperation({ summary: 'Create or update a permission override' })
  upsert(@Body() dto: CreateOverrideDto) {
    return this.svc.upsert(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a permission override' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
