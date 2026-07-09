import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApprovalStepResponse {
  @ApiProperty() id: number;
  @ApiProperty() stepOrder: number;
  @ApiProperty() approverId: string;
  @ApiProperty() status: string;
  @ApiPropertyOptional() comments?: string;
  @ApiPropertyOptional() actionDate?: Date;
}

export class ApprovalHistoryResponse {
  @ApiProperty() id: number;
  @ApiProperty() workflowId: number;
  @ApiPropertyOptional() projectId?: number;
  @ApiPropertyOptional() entityType?: string;
  @ApiPropertyOptional() entityId?: string;
  @ApiProperty() requestedBy: string;
  @ApiProperty() status: string;
  @ApiPropertyOptional() currentStep?: number;
  @ApiPropertyOptional() completedAt?: Date;
  @ApiProperty({ type: [ApprovalStepResponse] })
  steps: ApprovalStepResponse[];
}
