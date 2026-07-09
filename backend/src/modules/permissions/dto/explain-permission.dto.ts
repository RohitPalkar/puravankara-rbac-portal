import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class ExplainPermissionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  projectId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  module: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  action: string;
}

export class ExplainStep {
  @ApiProperty()
  step: string;

  @ApiProperty()
  result: boolean;

  @ApiProperty()
  message: string;
}

export class ExplainPermissionResponse {
  @ApiProperty()
  allowed: boolean;

  @ApiProperty()
  source: string;

  @ApiProperty({ type: [ExplainStep] })
  explanation: ExplainStep[];
}
