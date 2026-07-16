import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  IsBoolean,
  IsDateString,
  IsString,
} from 'class-validator';

export class UpdateDelegationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  toUserId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  moduleId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
