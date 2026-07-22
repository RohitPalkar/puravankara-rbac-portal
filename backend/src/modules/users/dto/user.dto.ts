import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsInt,
  ValidateNested,
  IsEnum,
  Min,
} from 'class-validator';
import { ProfileType } from '../../../common/enums';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  departmentId: number;

  @ApiPropertyOptional({ default: 'PERMANENT' })
  @IsOptional()
  @IsString()
  employmentStatus?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// --- Permission Profile DTOs (must precede UpdateUserDto) ---

export class ProfileProjectDto {
  @ApiProperty()
  @IsInt()
  projectId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  selectedBy?: string;
}

export class ProfileSubModuleDto {
  @ApiProperty()
  @IsInt()
  subModuleId: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  inheritFutureProjects?: boolean;

  @ApiProperty({ type: [ProfileProjectDto] })
  @ValidateNested({ each: true })
  @Type(() => ProfileProjectDto)
  projects: ProfileProjectDto[];
}

export class ProfileModuleDto {
  @ApiProperty()
  @IsInt()
  moduleId: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiProperty({ type: [ProfileSubModuleDto] })
  @ValidateNested({ each: true })
  @Type(() => ProfileSubModuleDto)
  subModules: ProfileSubModuleDto[];
}

export class CreatePermissionProfileDto {
  @ApiProperty({ enum: ProfileType })
  @IsEnum(ProfileType)
  profileType: ProfileType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ default: 'ACTIVE' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  departmentId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  roleId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  buddyUserId?: string;

  @ApiPropertyOptional({ type: [ProfileModuleDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProfileModuleDto)
  modules?: ProfileModuleDto[];
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  departmentId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employmentStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [CreatePermissionProfileDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePermissionProfileDto)
  profiles?: CreatePermissionProfileDto[];
}

export class CreateUserRoleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  departmentId: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  roleId: number;
}

export class CreateUserReportingLineDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reportsToUserId: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  levelRank: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  effectiveFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  effectiveTo?: string;
}

export class ReportingEntryDto {
  @ApiProperty()
  @IsInt()
  levelRank: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  managerId: string;
}

export class UserOrganizationDto {
  @ApiProperty({ type: [Number] })
  @IsInt({ each: true })
  zones: number[];

  @ApiProperty()
  @IsInt()
  primaryRole: number;

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsInt({ each: true })
  secondaryRoles?: number[];

  @ApiPropertyOptional({ type: [ReportingEntryDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ReportingEntryDto)
  reporting?: ReportingEntryDto[];
}

export class CreateUserFullDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateUserDto)
  basic: CreateUserDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => UserOrganizationDto)
  organization: UserOrganizationDto;

  @ApiPropertyOptional({ type: [CreatePermissionProfileDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePermissionProfileDto)
  profiles?: CreatePermissionProfileDto[];
}
