import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export class AssignProjectAccessDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  projectId: number;
}

export class AssignBulkProjectAccessDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ type: [Number] })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  projectIds: number[];
}

export class CreateProjectGroupDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  isActive?: boolean;
}

export class UpdateProjectGroupDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  isActive?: boolean;
}

export class AddProjectToGroupDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  groupId: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  projectId: number;
}

export class AssignUserProjectGroupDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  groupId: number;
}
