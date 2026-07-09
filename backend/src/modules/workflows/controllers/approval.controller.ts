import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApprovalService } from '../services/approval.service';
import { ApprovalActionDto } from '../dto/approval-action.dto';
import { ApprovalHistoryResponse } from '../dto/approval-history.dto';
import { RequirePermission } from '../../permissions/decorators/require-permission.decorator';

@ApiTags('Approvals')
@ApiBearerAuth()
@Controller('approvals')
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Get('pending')
  @ApiOperation({ summary: 'Get my pending approvals' })
  async getPending(@Req() req: any) {
    const userId = req.user.empId || req.user.userId;
    return this.approvalService.getPending(userId);
  }

  @Get('submitted')
  @ApiOperation({ summary: 'Get my submitted requests' })
  async getSubmitted(@Req() req: any) {
    const userId = req.user.empId || req.user.userId;
    return this.approvalService.getSubmitted(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get approval request detail with step history' })
  async getDetail(@Param('id') id: string): Promise<ApprovalHistoryResponse> {
    return this.approvalService.getDetail(+id);
  }

  @Post(':requestId/action')
  @ApiOperation({ summary: 'Approve or reject the current step' })
  @RequirePermission({ module: 'IOM', action: 'APPROVE' })
  async performAction(
    @Param('requestId') requestId: string,
    @Body() dto: ApprovalActionDto,
    @Req() req: any,
  ): Promise<ApprovalHistoryResponse> {
    const userId = req.user.empId || req.user.userId;
    return this.approvalService.performAction(
      +requestId,
      dto.action as 'APPROVE' | 'REJECT',
      userId,
      dto.comments,
    );
  }
}
