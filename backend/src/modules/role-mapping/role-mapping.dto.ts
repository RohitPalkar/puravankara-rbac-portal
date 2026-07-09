import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsArray,
  IsOptional,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';

class PermissionActionEntry {
  @ApiProperty()
  @IsInt()
  moduleId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  subModuleId?: number;

  @ApiProperty({ type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1)
  actionIds: number[];
}

export class CreateRoleMappingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  hierarchyLevelRank: number;

  @ApiProperty()
  @IsInt()
  departmentId: number;

  @ApiProperty({ type: [PermissionActionEntry] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionActionEntry)
  permissions: PermissionActionEntry[];
}

export class RoleMappingListItem {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  hierarchyLevel: number;

  @ApiProperty()
  departmentName: string;

  @ApiProperty()
  moduleCount: number;

  @ApiProperty()
  permissionCount: number;

  @ApiProperty()
  status: string;
}

export class RoleMappingDetailModule {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: () => [RoleMappingDetailSubModule] })
  subModules: RoleMappingDetailSubModule[];

  @ApiProperty({ type: () => [RoleMappingDetailAction] })
  actions: RoleMappingDetailAction[];
}

export class RoleMappingDetailSubModule {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: () => [RoleMappingDetailAction] })
  actions: RoleMappingDetailAction[];
}

export class RoleMappingDetailAction {
  @ApiProperty()
  id: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  label: string;
}

export class RoleMappingDetailResponse {
  @ApiProperty()
  roleId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  hierarchyLevel: number;

  @ApiProperty()
  departmentId: number;

  @ApiProperty()
  departmentName: string;

  @ApiProperty({ type: [RoleMappingDetailModule] })
  modules: RoleMappingDetailModule[];

  @ApiProperty()
  status: string;
}
