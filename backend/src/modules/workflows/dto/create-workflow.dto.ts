import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

export class CreateWorkflowStepDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  stepOrder: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  roleId: number;

  @ApiProperty()
  @IsString()
  @MaxLength(20)
  @IsNotEmpty()
  approvalType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  departmentId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  levelRank?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;
}

export class CreateWorkflowDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

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

  @ApiProperty({ type: [CreateWorkflowStepDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkflowStepDto)
  steps: CreateWorkflowStepDto[];
}
