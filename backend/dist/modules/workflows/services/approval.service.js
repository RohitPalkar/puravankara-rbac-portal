"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ApprovalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const approval_workflow_entity_1 = require("../entities/approval-workflow.entity");
const approval_step_entity_1 = require("../entities/approval-step.entity");
const approval_request_entity_1 = require("../entities/approval-request.entity");
const approval_request_step_entity_1 = require("../entities/approval-request-step.entity");
const user_delegation_entity_1 = require("../../delegation/entities/user-delegation.entity");
const delegation_service_1 = require("./delegation.service");
const audit_service_1 = require("../../audit/services/audit.service");
const notification_service_1 = require("../../notifications/services/notification.service");
let ApprovalService = ApprovalService_1 = class ApprovalService {
    requestRepo;
    requestStepRepo;
    workflowRepo;
    stepRepo;
    delegationRepo;
    delegationService;
    auditService;
    notificationService;
    logger = new common_1.Logger(ApprovalService_1.name);
    constructor(requestRepo, requestStepRepo, workflowRepo, stepRepo, delegationRepo, delegationService, auditService, notificationService) {
        this.requestRepo = requestRepo;
        this.requestStepRepo = requestStepRepo;
        this.workflowRepo = workflowRepo;
        this.stepRepo = stepRepo;
        this.delegationRepo = delegationRepo;
        this.delegationService = delegationService;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }
    async submit(workflowId, dto, requestedBy) {
        const workflow = await this.workflowRepo.findOne({
            where: { id: workflowId, isActive: true },
        });
        if (!workflow)
            throw new common_1.NotFoundException('Workflow not found or inactive');
        const steps = await this.stepRepo.find({
            where: { workflowId: workflow.id },
            order: { stepOrder: 'ASC' },
        });
        if (steps.length === 0)
            throw new common_1.BadRequestException('Workflow has no steps defined');
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
            const approvers = await this.delegationService.findEligibleApprovers(stepDef.departmentId, stepDef.roleId, stepDef.levelRank, workflow.moduleId);
            if (approvers.length === 0) {
                this.logger.warn(`No eligible approvers for step ${stepDef.stepOrder} of workflow ${workflowId}`);
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
            .catch(() => { });
        const approverSteps = await this.requestStepRepo.find({
            where: { requestId: saved.id, status: 'PENDING' },
        });
        const approverIds = [...new Set(approverSteps.map((s) => s.approverId))];
        for (const approverId of approverIds) {
            this.notificationService
                .sendToUser(approverId, `Approval Request Pending`, `A new approval request requires your action`, 'APPROVAL_REQUEST', String(saved.id))
                .catch(() => { });
        }
        return this.getDetail(saved.id);
    }
    async performAction(requestId, action, userId, comments) {
        const request = await this.requestRepo.findOne({
            where: { id: requestId },
        });
        if (!request)
            throw new common_1.NotFoundException('Approval request not found');
        if (request.status !== 'PENDING')
            throw new common_1.BadRequestException('Request is not pending');
        const currentStep = await this.requestStepRepo.findOne({
            where: {
                requestId: request.id,
                stepOrder: request.currentStep,
                status: 'PENDING',
            },
        });
        if (!currentStep)
            throw new common_1.BadRequestException('No pending step for you at this stage');
        const isOriginalApprover = currentStep.approverId === userId;
        const isDelegated = !isOriginalApprover &&
            (await this.isDelegatedApprover(currentStep.approverId, userId));
        if (!isOriginalApprover && !isDelegated) {
            throw new common_1.BadRequestException('You are not authorized to act on this step');
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
            .catch(() => { });
        if (action === 'APPROVE') {
            this.notificationService
                .sendToUser(request.requestedBy, 'Request Approved', `Your approval request #${requestId} has been approved`, 'APPROVAL_REQUEST', String(requestId))
                .catch(() => { });
        }
        if (action === 'REJECT') {
            request.status = 'REJECTED';
            request.completedAt = new Date();
            await this.requestRepo.save(request);
            this.notificationService
                .sendToUser(request.requestedBy, 'Request Rejected', `Your approval request #${requestId} has been rejected${comments ? ': ' + comments : ''}`, 'APPROVAL_REQUEST', String(requestId))
                .catch(() => { });
            return this.getDetail(request.id);
        }
        const steps = await this.stepRepo.find({
            where: { workflowId: request.workflowId },
            order: { stepOrder: 'ASC' },
        });
        const nextStepIndex = steps.findIndex((s) => s.stepOrder === request.currentStep) + 1;
        if (nextStepIndex < steps.length) {
            request.currentStep = steps[nextStepIndex].stepOrder;
            await this.requestRepo.save(request);
            await this.requestStepRepo.update({
                requestId: request.id,
                stepOrder: request.currentStep,
                status: 'WAITING',
            }, { status: 'PENDING' });
        }
        else {
            request.status = 'APPROVED';
            request.completedAt = new Date();
            await this.requestRepo.save(request);
        }
        return this.getDetail(request.id);
    }
    async getPending(userId) {
        const stepIds = await this.requestStepRepo.find({
            where: { approverId: userId, status: 'PENDING' },
        });
        if (stepIds.length === 0)
            return [];
        const requestIds = [...new Set(stepIds.map((s) => s.requestId))];
        return this.requestRepo.find({
            where: requestIds.map((id) => ({ id })),
            order: { createdAt: 'DESC' },
        });
    }
    async getSubmitted(userId) {
        return this.requestRepo.find({
            where: { requestedBy: userId },
            order: { createdAt: 'DESC' },
        });
    }
    async getDetail(requestId) {
        const request = await this.requestRepo.findOne({
            where: { id: requestId },
        });
        if (!request)
            throw new common_1.NotFoundException('Approval request not found');
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
    async isDelegatedApprover(originalApproverId, userId) {
        const now = new Date();
        const delegation = await this.delegationRepo.findOne({
            where: {
                fromUserId: originalApproverId,
                toUserId: userId,
                isActive: true,
                startDate: (0, typeorm_2.LessThanOrEqual)(now),
            },
        });
        if (!delegation)
            return false;
        if (delegation.endDate && delegation.endDate < now)
            return false;
        return true;
    }
};
exports.ApprovalService = ApprovalService;
exports.ApprovalService = ApprovalService = ApprovalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(approval_request_entity_1.ApprovalRequest)),
    __param(1, (0, typeorm_1.InjectRepository)(approval_request_step_entity_1.ApprovalRequestStep)),
    __param(2, (0, typeorm_1.InjectRepository)(approval_workflow_entity_1.ApprovalWorkflow)),
    __param(3, (0, typeorm_1.InjectRepository)(approval_step_entity_1.ApprovalStep)),
    __param(4, (0, typeorm_1.InjectRepository)(user_delegation_entity_1.UserDelegation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        delegation_service_1.DelegationService,
        audit_service_1.AuditService,
        notification_service_1.NotificationService])
], ApprovalService);
//# sourceMappingURL=approval.service.js.map