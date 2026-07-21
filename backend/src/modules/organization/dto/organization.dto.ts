import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class HierarchyLevelDto {
  @ApiProperty({ description: 'Level number (1-based)' })
  @IsInt()
  @Min(1)
  @Max(10)
  levelNumber: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  roleName: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  displayOrder: number;
}

export class CreateDepartmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Employee ID of department admin' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  departmentAdminId?: string;

  @ApiProperty({ description: 'Number of hierarchy levels (1-10)' })
  @IsInt()
  @Min(1)
  @Max(10)
  numberOfLevels: number;

  @ApiProperty({ description: 'Zone IDs to map', type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  zoneIds: number[];

  @ApiProperty({
    description: 'Hierarchy level definitions',
    type: [HierarchyLevelDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => HierarchyLevelDto)
  hierarchyLevels: HierarchyLevelDto[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateDepartmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departmentAdminId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  numberOfLevels?: number;

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  zoneIds?: number[];

  @ApiPropertyOptional({ type: [HierarchyLevelDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HierarchyLevelDto)
  hierarchyLevels?: HierarchyLevelDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateRoleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  hierarchyLevelRank: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateRoleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  hierarchyLevelRank?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
