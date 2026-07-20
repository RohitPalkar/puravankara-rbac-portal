import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateZoneDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    type: Number,
    example: 1.0,
    description: 'Salary capping multiplier (1.00 - 10.00)',
  })
  @IsOptional()
  @IsNumber()
  @Min(1.0)
  @Max(10.0)
  @Type(() => Number)
  salaryCapping?: number;

  @ApiPropertyOptional({ example: '2026-07-20', description: 'Start date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'End date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class UpdateZoneDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    type: Number,
    example: 1.0,
    description: 'Salary capping multiplier (1.00 - 10.00)',
  })
  @IsOptional()
  @IsNumber()
  @Min(1.0)
  @Max(10.0)
  @Type(() => Number)
  salaryCapping?: number;

  @ApiPropertyOptional({ example: '2026-07-20', description: 'Start date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'End date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class ZoneResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: Number, example: 1.0 })
  salaryCapping: number;

  @ApiProperty({ example: '2026-07-20' })
  startDate: Date;

  @ApiProperty({ example: '2026-12-31', nullable: true })
  endDate: Date | null;

  @ApiProperty({ example: '2x' })
  salaryCappingLabel: string;

  @ApiProperty({ example: ['Mumbai', 'Delhi'] })
  citiesMapped: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
