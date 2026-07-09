import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class CreateDelegationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fromUserId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  toUserId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  moduleId?: number;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-01-10' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
