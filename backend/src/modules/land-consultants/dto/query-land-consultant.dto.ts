import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { ConsultantType } from '../entities/land-consultant.entity';

export class QueryLandConsultantDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ConsultantType })
  @IsOptional()
  @IsEnum(ConsultantType)
  consultantType?: ConsultantType;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Filter by BD Executive empId' })
  @IsOptional()
  bdExecutiveId?: string;
}
