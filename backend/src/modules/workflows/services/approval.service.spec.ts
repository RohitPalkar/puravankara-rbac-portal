import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ApprovalService } from './approval.service';
import { DelegationService } from './delegation.service';
import { ApprovalWorkflow } from '../entities/approval-workflow.entity';
import { ApprovalStep } from '../entities/approval-step.entity';
import { ApprovalRequest } from '../entities/approval-request.entity';
import { ApprovalRequestStep } from '../entities/approval-request-step.entity';
import { UserDelegation } from '../../delegation/entities/user-delegation.entity';
import { AuditService } from '../../audit/services/audit.service';
import { NotificationService } from '../../notifications/services/notification.service';

describe('ApprovalService', () => {
  let service: ApprovalService;
  let requestRepo: jest.Mocked<Repository<ApprovalRequest>>;
  let requestStepRepo: jest.Mocked<Repository<ApprovalRequestStep>>;
  let workflowRepo: jest.Mocked<Repository<ApprovalWorkflow>>;
  let stepRepo: jest.Mocked<Repository<ApprovalStep>>;
  let delegationRepo: jest.Mocked<Repository<UserDelegation>>;
  let delegationService: jest.Mocked<DelegationService>;
  let auditService: jest.Mocked<AuditService>;
  let notificationService: jest.Mocked<NotificationService>;

  const mockWorkflow = {
    id: 1,
    name: 'Project Approval',
    isActive: true,
    moduleId: 1,
  } as ApprovalWorkflow;
  const mockSteps: ApprovalStep[] = [
    {
      id: 1,
      workflowId: 1,
      stepOrder: 1,
      departmentId: 1,
      roleId: 2,
      levelRank: 1,
    } as ApprovalStep,
    {
      id: 2,
      workflowId: 1,
      stepOrder: 2,
      departmentId: 1,
      roleId: 3,
      levelRank: 2,
    } as ApprovalStep,
  ];
  const mockRequest: ApprovalRequest = {
    id: 1,
    workflowId: 1,
    projectId: 10,
    entityType: 'PROJECT',
    entityId: '10',
    requestedBy: 'PPL00005',
    currentStep: 1,
    status: 'PENDING',
    completedAt: null,
    createdAt: new Date(),
  } as ApprovalRequest;

  const mockDetailSteps: ApprovalRequestStep[] = [
    {
      id: 10,
      requestId: 1,
      stepOrder: 1,
      approverId: 'PPL00010',
      status: 'PENDING',
      comments: null,
      actionDate: null,
    } as ApprovalRequestStep,
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovalService,
        {
          provide: getRepositoryToken(ApprovalRequest),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ApprovalRequestStep),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ApprovalWorkflow),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(ApprovalStep),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(UserDelegation),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: DelegationService,
          useValue: { findEligibleApprovers: jest.fn() },
        },
        {
          provide: AuditService,
          useValue: { createLog: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: NotificationService,
          useValue: { sendToUser: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<ApprovalService>(ApprovalService);
    requestRepo = module.get(getRepositoryToken(ApprovalRequest));
    requestStepRepo = module.get(getRepositoryToken(ApprovalRequestStep));
    workflowRepo = module.get(getRepositoryToken(ApprovalWorkflow));
    stepRepo = module.get(getRepositoryToken(ApprovalStep));
    delegationRepo = module.get(getRepositoryToken(UserDelegation));
    delegationService = module.get(DelegationService);
    auditService = module.get(AuditService);
    notificationService = module.get(NotificationService);
  });

  describe('submit', () => {
    const submitDto = { projectId: 10, entityType: 'PROJECT', entityId: '10' };

    it('should create request and assign first step approvers', async () => {
      workflowRepo.findOne.mockResolvedValue(mockWorkflow);
      stepRepo.find.mockResolvedValue(mockSteps);
      requestRepo.create.mockReturnValue(mockRequest);
      requestRepo.save.mockResolvedValue(mockRequest);
      delegationService.findEligibleApprovers.mockResolvedValue(['PPL00010']);
      requestStepRepo.create.mockReturnValue({} as ApprovalRequestStep);
      requestStepRepo.save.mockResolvedValue({} as ApprovalRequestStep);
      requestStepRepo.find.mockResolvedValue(mockDetailSteps);
      requestRepo.findOne.mockResolvedValue(mockRequest);

      const result = await service.submit(1, submitDto, 'PPL00005');

      expect(result).toBeDefined();
      expect(auditService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'SUBMITTED' }),
      );
      expect(notificationService.sendToUser).toHaveBeenCalledWith(
        'PPL00010',
        expect.any(String),
        expect.any(String),
        'APPROVAL_REQUEST',
        '1',
      );
    });

    it('should throw if workflow not found', async () => {
      workflowRepo.findOne.mockResolvedValue(null);

      await expect(service.submit(999, submitDto, 'PPL00005')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw if workflow has no steps', async () => {
      workflowRepo.findOne.mockResolvedValue(mockWorkflow);
      stepRepo.find.mockResolvedValue([]);

      await expect(service.submit(1, submitDto, 'PPL00005')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('performAction', () => {
    const mockPendingStep = {
      id: 10,
      requestId: 1,
      stepOrder: 1,
      approverId: 'PPL00010',
      status: 'PENDING',
    } as ApprovalRequestStep;

    beforeEach(() => {
      requestRepo.findOne.mockResolvedValue(mockRequest);
      requestStepRepo.find.mockResolvedValue(mockDetailSteps);
    });

    it('should approve request at first step and advance to next step', async () => {
      requestStepRepo.findOne.mockResolvedValue(mockPendingStep);
      requestStepRepo.save.mockResolvedValue({
        ...mockPendingStep,
        status: 'APPROVED',
      });
      stepRepo.find.mockResolvedValue(mockSteps);
      requestRepo.save.mockResolvedValue({
        ...mockRequest,
        currentStep: 2,
      });
      requestStepRepo.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.performAction(1, 'APPROVE', 'PPL00010');

      expect(result).toBeDefined();
      expect(auditService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'APPROVED' }),
      );
      expect(notificationService.sendToUser).toHaveBeenCalledWith(
        'PPL00005',
        expect.any(String),
        expect.any(String),
        'APPROVAL_REQUEST',
        '1',
      );
    });

    it('should reject request and complete it', async () => {
      requestStepRepo.findOne.mockResolvedValue(mockPendingStep);
      requestStepRepo.save.mockResolvedValue({
        ...mockPendingStep,
        status: 'REJECTED',
      });
      const rejectedRequest = {
        ...mockRequest,
        status: 'REJECTED' as const,
        completedAt: new Date(),
      } as ApprovalRequest;
      requestRepo.save.mockResolvedValue(rejectedRequest);

      const result = await service.performAction(
        1,
        'REJECT',
        'PPL00010',
        'Not approved',
      );

      expect(result).toBeDefined();
      expect(auditService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'REJECTED' }),
      );
    });

    it('should throw if request not found', async () => {
      requestRepo.findOne.mockResolvedValue(null);

      await expect(
        service.performAction(999, 'APPROVE', 'PPL00010'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if request is not pending', async () => {
      requestRepo.findOne.mockResolvedValue({
        ...mockRequest,
        status: 'APPROVED',
      });

      await expect(
        service.performAction(1, 'APPROVE', 'PPL00010'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if user is not authorized for step', async () => {
      requestStepRepo.findOne.mockResolvedValue(mockPendingStep);
      delegationRepo.findOne.mockResolvedValue(null);

      await expect(
        service.performAction(1, 'APPROVE', 'PPL00999'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPending / getSubmitted', () => {
    it('should return pending requests for user', async () => {
      requestStepRepo.find.mockResolvedValue([
        { requestId: 1 } as ApprovalRequestStep,
      ]);
      requestRepo.find.mockResolvedValue([mockRequest]);

      const result = await service.getPending('PPL00010');

      expect(result).toHaveLength(1);
    });

    it('should return empty when no pending steps', async () => {
      requestStepRepo.find.mockResolvedValue([]);

      const result = await service.getPending('PPL00010');

      expect(result).toEqual([]);
    });

    it('should return submitted requests by user', async () => {
      requestRepo.find.mockResolvedValue([mockRequest]);

      const result = await service.getSubmitted('PPL00005');

      expect(result).toHaveLength(1);
      expect(requestRepo.find).toHaveBeenCalledWith({
        where: { requestedBy: 'PPL00005' },
        order: { createdAt: 'DESC' },
      });
    });
  });
});
