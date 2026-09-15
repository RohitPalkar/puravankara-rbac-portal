import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsEmail,
  Matches,
  ValidateIf,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ConsultantType } from '../entities/land-consultant.entity';

export class CreateLandConsultantDto {
  @ApiProperty({ enum: ConsultantType, example: ConsultantType.REGISTERED })
  @IsEnum(ConsultantType)
  @IsNotEmpty()
  consultantType: ConsultantType;

  @ApiPropertyOptional({ description: 'Required when consultantType=Registered' })
  @ValidateIf((o) => o.consultantType === ConsultantType.REGISTERED)
  @IsString()
  @IsNotEmpty()
  businessName?: string;

  @ApiPropertyOptional({ description: 'Required when consultantType=Individual' })
  @ValidateIf((o) => o.consultantType === ConsultantType.INDIVIDUAL)
  @IsString()
  @IsNotEmpty()
  consultantName?: string;

  @ApiPropertyOptional({ description: 'GST No. (15 chars, only for Registered)' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
    message: 'Invalid GST No. format',
  })
  gstNo?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contactPersonName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10,15}$/, { message: 'Contact Number must be 10-15 digits' })
  contactNumber: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  emailAddress: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ description: 'Specialization dropdown value' })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiProperty({ description: 'BD Executive user empId' })
  @IsString()
  @IsNotEmpty()
  bdExecutiveId: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPuravankaraEmployee?: boolean;

  @ApiPropertyOptional({ description: 'Required if isPuravankaraEmployee=true' })
  @ValidateIf((o) => o.isPuravankaraEmployee === true)
  @IsInt()
  @Type(() => Number)
  departmentId?: number;

  @ApiPropertyOptional({ description: 'Required if isPuravankaraEmployee=true' })
  @ValidateIf((o) => o.isPuravankaraEmployee === true)
  @IsString()
  @IsNotEmpty()
  employeeId?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateLandConsultantDto {
  @ApiPropertyOptional({ enum: ConsultantType })
  @IsOptional()
  @IsEnum(ConsultantType)
  consultantType?: ConsultantType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  businessName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  consultantName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gstNo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  contactPersonName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10,15}$/, { message: 'Contact Number must be 10-15 digits' })
  contactNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  emailAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  bdExecutiveId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPuravankaraEmployee?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  departmentId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
