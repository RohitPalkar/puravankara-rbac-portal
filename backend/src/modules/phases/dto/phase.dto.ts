import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePhaseDto {
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  brandId: number;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  cityId: number;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  projectId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phaseName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sfdcPhaseName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sfdcBlockName?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  possessionDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  agreementExecutionPercentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bookingGatewayId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  milestoneGatewayId?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  launchEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  launchStartDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  launchEndDate?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  sustenanceEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sustenanceDate?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePhaseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  brandId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  cityId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  projectId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phaseName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  sfdcPhaseName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sfdcBlockName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  possessionDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  agreementExecutionPercentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bookingGatewayId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  milestoneGatewayId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  launchEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  launchStartDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  launchEndDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  sustenanceEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sustenanceDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateLaunchDto {
  @ApiProperty()
  @IsBoolean()
  launchEnabled: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  launchStartDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  launchEndDate?: string;
}

export class PhaseResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  brandId: number;

  @ApiProperty()
  cityId: number;

  @ApiProperty()
  projectId: number;

  @ApiProperty()
  phaseName: string;

  @ApiProperty()
  sfdcPhaseName: string;

  @ApiPropertyOptional()
  sfdcBlockName?: string;

  @ApiProperty()
  possessionDate: string;

  @ApiPropertyOptional()
  agreementExecutionPercentage?: number;

  @ApiPropertyOptional()
  bookingGatewayId?: string;

  @ApiPropertyOptional()
  milestoneGatewayId?: string;

  @ApiProperty()
  launchEnabled: boolean;

  @ApiPropertyOptional()
  launchStartDate?: string;

  @ApiPropertyOptional()
  launchEndDate?: string;

  @ApiProperty()
  sustenanceEnabled: boolean;

  @ApiPropertyOptional()
  sustenanceDate?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
