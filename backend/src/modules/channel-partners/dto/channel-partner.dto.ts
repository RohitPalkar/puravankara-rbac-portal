import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateChannelPartnerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cpId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cpName: string;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  cpTypeId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateChannelPartnerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  cpId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  cpName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  cpTypeId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ChannelPartnerResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  cpId: string;

  @ApiProperty()
  cpName: string;

  @ApiProperty()
  cpTypeId: number;

  @ApiProperty()
  startDate: string;

  @ApiPropertyOptional()
  endDate?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
