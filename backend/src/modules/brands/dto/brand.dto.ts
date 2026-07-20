import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, Min, Max, IsInt,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBrandDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  brandName: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  @Max(100)
  @Type(() => Number)
  salaryMultiplier: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  razorpayMerchantId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  razorpaySecretKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  easebuzzBookingSalt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  easebuzzBookingKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  easebuzzBookingSubMerchantId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  easebuzzMilestoneSalt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  easebuzzMilestoneKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  easebuzzMilestoneSubMerchantId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  billingName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'Invalid PAN format' })
  panNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gstin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^\d{6}$/, { message: 'PIN code must be 6 digits' })
  pinCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  reraRegularizationPercentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  reraQualificationPercentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  maximumRegularizationDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  rtmRegularizationPercentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  rtmQualificationPercentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  regularizationStartDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateBrandDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  brandName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(100)
  @Type(() => Number)
  salaryMultiplier?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  razorpayMerchantId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  razorpaySecretKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  easebuzzBookingSalt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  easebuzzBookingKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  easebuzzBookingSubMerchantId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  easebuzzMilestoneSalt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  easebuzzMilestoneKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  easebuzzMilestoneSubMerchantId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  billingName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'Invalid PAN format' })
  panNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gstin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^\d{6}$/, { message: 'PIN code must be 6 digits' })
  pinCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  reraRegularizationPercentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  reraQualificationPercentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  maximumRegularizationDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  rtmRegularizationPercentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  rtmQualificationPercentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  regularizationStartDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class BrandResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  brandName: string;

  @ApiProperty()
  salaryMultiplier: number;

  @ApiPropertyOptional()
  razorpayMerchantId?: string;

  @ApiPropertyOptional()
  razorpaySecretKey?: string;

  @ApiPropertyOptional()
  easebuzzBookingSalt?: string;

  @ApiPropertyOptional()
  easebuzzBookingKey?: string;

  @ApiPropertyOptional()
  easebuzzBookingSubMerchantId?: string;

  @ApiPropertyOptional()
  easebuzzMilestoneSalt?: string;

  @ApiPropertyOptional()
  easebuzzMilestoneKey?: string;

  @ApiPropertyOptional()
  easebuzzMilestoneSubMerchantId?: string;

  @ApiPropertyOptional()
  billingName?: string;

  @ApiPropertyOptional()
  panNumber?: string;

  @ApiPropertyOptional()
  gstin?: string;

  @ApiPropertyOptional()
  address1?: string;

  @ApiPropertyOptional()
  address2?: string;

  @ApiPropertyOptional()
  city?: string;

  @ApiPropertyOptional()
  state?: string;

  @ApiPropertyOptional()
  country?: string;

  @ApiPropertyOptional()
  pinCode?: string;

  @ApiPropertyOptional()
  logoUrl?: string;

  @ApiPropertyOptional()
  reraRegularizationPercentage?: number;

  @ApiPropertyOptional()
  reraQualificationPercentage?: number;

  @ApiPropertyOptional()
  maximumRegularizationDays?: number;

  @ApiPropertyOptional()
  rtmRegularizationPercentage?: number;

  @ApiPropertyOptional()
  rtmQualificationPercentage?: number;

  @ApiPropertyOptional()
  regularizationStartDate?: string;

  @ApiPropertyOptional()
  termsAndConditions?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}