import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class ApprovalActionDto {
  @ApiProperty({ enum: ['APPROVE', 'REJECT'] })
  @IsString()
  @IsNotEmpty()
  @IsIn(['APPROVE', 'REJECT'])
  action: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comments?: string;
}
