import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { WorkflowService } from '../services/workflow.service';
import { ApprovalService } from '../services/approval.service';
import { SubmitApprovalDto } from '../dto/submit-approval.dto';
import { CreateWorkflowDto } from '../dto/create-workflow.dto';
import { ApprovalHistoryResponse } from '../dto/approval-history.dto';
import { RequirePermission } from '../../permissions/decorators/require-permission.decorator';

@ApiTags('Workflows')
@ApiBearerAuth()
@Controller('workflows')
export class WorkflowController {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly approvalService: ApprovalService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workflow with approval steps' })
  @RequirePermission({ module: 'WORKFLOW', action: 'CREATE' })
  async create(@Body() dto: CreateWorkflowDto) {
    return this.workflowService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all active workflows' })
  async findAll() {
    return this.workflowService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow details' })
  async findById(@Param('id') id: string) {
    return this.workflowService.findById(+id);
  }

  @Get(':id/steps')
  @ApiOperation({ summary: 'Get workflow approval steps' })
  async getSteps(@Param('id') id: string) {
    return this.workflowService.getSteps(+id);
  }

  @Post(':workflowId/submit')
  @ApiOperation({ summary: 'Submit a new approval request' })
  @RequirePermission({ module: 'IOM', action: 'CREATE' })
  async submit(
    @Param('workflowId') workflowId: string,
    @Body() dto: SubmitApprovalDto,
    @Req() req: any,
  ): Promise<ApprovalHistoryResponse> {
    const userId = req.user.empId || req.user.userId;
    return this.approvalService.submit(+workflowId, dto, userId);
  }
}
