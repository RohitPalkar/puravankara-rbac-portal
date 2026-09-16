import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
  ValidateNested,
  Matches,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LaLocalityDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  localityName: string;

  @ApiProperty({ example: '411005' })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'Pincode must be 6 digits' })
  pincode: string;
}

export class LaMicromarketDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  micromarketName: string;

  @ApiPropertyOptional({ type: [LaLocalityDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LaLocalityDto)
  localities?: LaLocalityDto[];
}

export class LaRegionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  regionName: string;

  @ApiPropertyOptional({ type: [LaMicromarketDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LaMicromarketDto)
  micromarkets?: LaMicromarketDto[];
}

export class LaApprovalDto {
  @ApiProperty({ example: 'Land-use conversion (CLU)' })
  @IsString()
  @IsNotEmpty()
  genericApproval: string;

  @ApiPropertyOptional({ type: [String], example: ['PMRDA', 'PMC DP'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  governingBodies?: string[];

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  documents?: any[];
}

export class CreateLaCityDto {
  @ApiProperty({ example: 'Pune' })
  @IsString()
  @IsNotEmpty()
  cityName: string;

  @ApiProperty({ description: 'Business Zone id (FK to zones)' })
  @IsInt()
  @Type(() => Number)
  businessZoneId: number;

  @ApiPropertyOptional({ type: [LaRegionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LaRegionDto)
  regions?: LaRegionDto[];

  @ApiPropertyOptional({ type: [LaApprovalDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LaApprovalDto)
  approvals?: LaApprovalDto[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateLaCityDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  cityName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  businessZoneId?: number;

  @ApiPropertyOptional({ type: [LaRegionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LaRegionDto)
  regions?: LaRegionDto[];

  @ApiPropertyOptional({ type: [LaApprovalDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LaApprovalDto)
  approvals?: LaApprovalDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
