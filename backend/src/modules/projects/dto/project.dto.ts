import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  IsInt,
  IsEnum,
  Matches,
  ValidateNested,
  IsArray,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentGatewayType } from '../entities/project-payment-gateway.entity';
import { IncentiveType } from '../entities/project-incentive-rule.entity';

export class PaymentGatewayDto {
  @ApiProperty({ enum: PaymentGatewayType })
  @IsEnum(PaymentGatewayType)
  gatewayType: PaymentGatewayType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  merchantId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  secretKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  salt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  key?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subMerchantId?: string;
}

export class IncentiveRuleDto {
  @ApiProperty({ enum: IncentiveType })
  @IsEnum(IncentiveType)
  incentiveType: IncentiveType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  regularizationPercentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  payablePercentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  maxDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate?: string;
}

export class CreateProjectDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  brandId: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  cityId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

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
  @Matches(/^\d{6}$/, { message: 'PIN code must be 6 digits' })
  pinCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jvLogo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sfdcProjectName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  codename?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  termsHtml?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [PaymentGatewayDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentGatewayDto)
  paymentGateways?: PaymentGatewayDto[];

  @ApiPropertyOptional({ type: [IncentiveRuleDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IncentiveRuleDto)
  incentiveRules?: IncentiveRuleDto[];
}

export class UpdateProjectDto {
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
  @IsString()
  @IsNotEmpty()
  name?: string;

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
  @Matches(/^\d{6}$/, { message: 'PIN code must be 6 digits' })
  pinCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jvLogo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sfdcProjectName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  codename?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  termsHtml?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [PaymentGatewayDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentGatewayDto)
  paymentGateways?: PaymentGatewayDto[];

  @ApiPropertyOptional({ type: [IncentiveRuleDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IncentiveRuleDto)
  incentiveRules?: IncentiveRuleDto[];
}
