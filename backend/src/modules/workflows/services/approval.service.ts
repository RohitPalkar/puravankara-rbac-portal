import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
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

@Injectable()
export class ApprovalService {
  private readonly logger = new Logger(ApprovalService.name);

  constructor(
    @InjectRepository(ApprovalRequest)
    private readonly requestRepo: Repository<ApprovalRequest>,
    @InjectRepository(ApprovalRequestStep)
    private readonly requestStepRepo: Repository<ApprovalRequestStep>,
    @InjectRepository(ApprovalWorkflow)
    private readonly workflowRepo: Repository<ApprovalWorkflow>,
    @InjectRepository(ApprovalStep)
    private readonly stepRepo: Repository<ApprovalStep>,
    @InjectRepository(UserDelegation)
    private readonly delegationRepo: Repository<UserDelegation>,
    private readonly delegationService: DelegationService,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
  ) {}

  async submit(
    workflowId: number,
    dto: SubmitApprovalDto,
    requestedBy: string,
  ): Promise<ApprovalHistoryResponse> {
    const workflow = await this.workflowRepo.findOne({
      where: { id: workflowId, isActive: true },
    });
    if (!workflow)
      throw new NotFoundException('Workflow not found or inactive');

    const steps = await this.stepRepo.find({
      where: { workflowId: workflow.id },
      order: { stepOrder: 'ASC' },
    });
    if (steps.length === 0)
      throw new BadRequestException('Workflow has no steps defined');

    const request = this.requestRepo.create({
      workflowId: workflow.id,
      projectId: dto.projectId,
      entityType: dto.entityType,
      entityId: dto.entityId,
      requestedBy,
      currentStep: 1,
      status: 'PENDING',
    });
    const saved = await this.requestRepo.save(request);

    for (let i = 0; i < steps.length; i++) {
      const stepDef = steps[i];
      const isFirst = i === 0;
      const approvers = await this.delegationService.findEligibleApprovers(
        stepDef.departmentId,
        stepDef.roleId,
        stepDef.levelRank,
        workflow.moduleId,
      );

      if (approvers.length === 0) {
        this.logger.warn(
          `No eligible approvers for step ${stepDef.stepOrder} of workflow ${workflowId}`,
        );
        continue;
      }

      for (const approverId of approvers) {
        const reqStep = this.requestStepRepo.create({
          requestId: saved.id,
          stepOrder: stepDef.stepOrder,
          approverId,
          status: isFirst ? 'PENDING' : 'WAITING',
        });
        await this.requestStepRepo.save(reqStep);
      }
    }

    this.auditService
      .createLog({
        entityName: 'WORKFLOW',
        action: 'SUBMITTED',
        entityId: String(saved.id),
        newValue: {
          workflowId,
          projectId: dto.projectId,
          entityType: dto.entityType,
          entityId: dto.entityId,
        },
        performedBy: requestedBy,
        source: 'WORKFLOW',
      })
      .catch((err) => this.logger.error('Failed to create audit log for approval submission', err));

    const approverSteps = await this.requestStepRepo.find({
      where: { requestId: saved.id, status: 'PENDING' },
    });
    const approverIds = [...new Set(approverSteps.map((s) => s.approverId))];
    for (const approverId of approverIds) {
      this.notificationService
        .sendToUser(
          approverId,
          `Approval Request Pending`,
          `A new approval request requires your action`,
          'APPROVAL_REQUEST',
          String(saved.id),
        )
        .catch((err) => this.logger.error('Failed to send approval request notification to approver', err));
    }

    return this.getDetail(saved.id);
  }

  async performAction(
    requestId: number,
    action: 'APPROVE' | 'REJECT',
    userId: string,
    comments?: string,
  ): Promise<ApprovalHistoryResponse> {
    const request = await this.requestRepo.findOne({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Approval request not found');
    if (request.status !== 'PENDING')
      throw new BadRequestException('Request is not pending');

    const currentStep = await this.requestStepRepo.findOne({
      where: {
        requestId: request.id,
        stepOrder: request.currentStep,
        status: 'PENDING',
      },
    });
    if (!currentStep)
      throw new BadRequestException('No pending step for you at this stage');

    const isOriginalApprover = currentStep.approverId === userId;
    const isDelegated =
      !isOriginalApprover &&
      (await this.isDelegatedApprover(currentStep.approverId, userId));

    if (!isOriginalApprover && !isDelegated) {
      throw new BadRequestException(
        'You are not authorized to act on this step',
      );
    }

    currentStep.status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    currentStep.comments = comments || null;
    currentStep.actionDate = new Date();
    await this.requestStepRepo.save(currentStep);

    this.auditService
      .createLog({
        entityName: 'WORKFLOW',
        action: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        entityId: String(requestId),
        newValue: { stepOrder: request.currentStep, comments },
        performedBy: userId,
        source: 'WORKFLOW',
      })
      .catch((err) => this.logger.error('Failed to create audit log for approval action', err));

    if (action === 'APPROVE') {
      this.notificationService
        .sendToUser(
          request.requestedBy,
          'Request Approved',
          `Your approval request #${requestId} has been approved`,
          'APPROVAL_REQUEST',
          String(requestId),
        )
        .catch((err) => this.logger.error('Failed to send approval notification to requester', err));
    }

    if (action === 'REJECT') {
      request.status = 'REJECTED';
      request.completedAt = new Date();
      await this.requestRepo.save(request);

      this.notificationService
        .sendToUser(
          request.requestedBy,
          'Request Rejected',
          `Your approval request #${requestId} has been rejected${comments ? ': ' + comments : ''}`,
          'APPROVAL_REQUEST',
          String(requestId),
        )
        .catch((err) => this.logger.error('Failed to send rejection notification to requester', err));

      return this.getDetail(request.id);
    }

    const steps = await this.stepRepo.find({
      where: { workflowId: request.workflowId },
      order: { stepOrder: 'ASC' },
    });
    const nextStepIndex =
      steps.findIndex((s) => s.stepOrder === request.currentStep) + 1;

    if (nextStepIndex < steps.length) {
      request.currentStep = steps[nextStepIndex].stepOrder;
      await this.requestRepo.save(request);

      await this.requestStepRepo.update(
        {
          requestId: request.id,
          stepOrder: request.currentStep,
          status: 'WAITING',
        },
        { status: 'PENDING' },
      );
    } else {
      request.status = 'APPROVED';
      request.completedAt = new Date();
      await this.requestRepo.save(request);
    }

    return this.getDetail(request.id);
  }

  async getPending(userId: string): Promise<ApprovalRequest[]> {
    const stepIds = await this.requestStepRepo.find({
      where: { approverId: userId, status: 'PENDING' },
    });
    if (stepIds.length === 0) return [];

    const requestIds = [...new Set(stepIds.map((s) => s.requestId))];
    return this.requestRepo.find({
      where: requestIds.map((id) => ({ id })),
      order: { createdAt: 'DESC' },
    });
  }

  async getSubmitted(userId: string): Promise<ApprovalRequest[]> {
    return this.requestRepo.find({
      where: { requestedBy: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getDetail(requestId: number): Promise<ApprovalHistoryResponse> {
    const request = await this.requestRepo.findOne({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Approval request not found');

    const steps = await this.requestStepRepo.find({
      where: { requestId: request.id },
      order: { stepOrder: 'ASC' },
    });

    return {
      id: request.id,
      workflowId: request.workflowId,
      projectId: request.projectId,
      entityType: request.entityType,
      entityId: request.entityId,
      requestedBy: request.requestedBy,
      status: request.status,
      currentStep: request.currentStep,
      completedAt: request.completedAt,
      steps: steps.map((s) => ({
        id: s.id,
        stepOrder: s.stepOrder,
        approverId: s.approverId,
        status: s.status,
        comments: s.comments,
        actionDate: s.actionDate,
      })),
    };
  }

  private async isDelegatedApprover(
    originalApproverId: string,
    userId: string,
  ): Promise<boolean> {
    const now = new Date();
    const delegation = await this.delegationRepo.findOne({
      where: {
        fromUserId: originalApproverId,
        toUserId: userId,
        isActive: true,
        startDate: LessThanOrEqual(now),
      },
    });
    if (!delegation) return false;
    if (delegation.endDate && delegation.endDate < now) return false;
    return true;
  }
}
