import { WorkflowService } from '../services/workflow.service';
import { ApprovalService } from '../services/approval.service';
import { SubmitApprovalDto } from '../dto/submit-approval.dto';
import { CreateWorkflowDto } from '../dto/create-workflow.dto';
import { ApprovalHistoryResponse } from '../dto/approval-history.dto';
export declare class WorkflowController {
    private readonly workflowService;
    private readonly approvalService;
    constructor(workflowService: WorkflowService, approvalService: ApprovalService);
    create(dto: CreateWorkflowDto): Promise<{
        workflow: import("../entities/approval-workflow.entity").ApprovalWorkflow;
        steps: import("../entities/approval-step.entity").ApprovalStep[];
    }>;
    findAll(): Promise<import("../entities/approval-workflow.entity").ApprovalWorkflow[]>;
    findById(id: string): Promise<import("../entities/approval-workflow.entity").ApprovalWorkflow>;
    getSteps(id: string): Promise<import("../entities/approval-step.entity").ApprovalStep[]>;
    submit(workflowId: string, dto: SubmitApprovalDto, req: any): Promise<ApprovalHistoryResponse>;
}
