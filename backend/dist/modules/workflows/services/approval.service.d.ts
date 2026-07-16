import { Repository } from 'typeorm';
import { ApprovalWorkflow } from '../entities/approval-workflow.entity';
import { ApprovalStep } from '../entities/approval-step.entity';
import { ApprovalRequest } from '../entities/approval-request.entity';
import { ApprovalRequestStep } from '../entities/approval-request-step.entity';
import { UserDelegation } from '../../delegation/entities/user-delegation.entity';
import { DelegationService } from './delegation.service';
import { SubmitApprovalDto } from '../dto/submit-approval.dto';
import { ApprovalHistoryResponse } from '../dto/approval-history.dto';
import { AuditService } from '../../audit/services/audit.service';
import { NotificationService } from '../../notifications/services/notification.service';
export declare class ApprovalService {
    private readonly requestRepo;
    private readonly requestStepRepo;
    private readonly workflowRepo;
    private readonly stepRepo;
    private readonly delegationRepo;
    private readonly delegationService;
    private readonly auditService;
    private readonly notificationService;
    private readonly logger;
    constructor(requestRepo: Repository<ApprovalRequest>, requestStepRepo: Repository<ApprovalRequestStep>, workflowRepo: Repository<ApprovalWorkflow>, stepRepo: Repository<ApprovalStep>, delegationRepo: Repository<UserDelegation>, delegationService: DelegationService, auditService: AuditService, notificationService: NotificationService);
    submit(workflowId: number, dto: SubmitApprovalDto, requestedBy: string): Promise<ApprovalHistoryResponse>;
    performAction(requestId: number, action: 'APPROVE' | 'REJECT', userId: string, comments?: string): Promise<ApprovalHistoryResponse>;
    getPending(userId: string): Promise<ApprovalRequest[]>;
    getSubmitted(userId: string): Promise<ApprovalRequest[]>;
    getDetail(requestId: number): Promise<ApprovalHistoryResponse>;
    private isDelegatedApprover;
}
