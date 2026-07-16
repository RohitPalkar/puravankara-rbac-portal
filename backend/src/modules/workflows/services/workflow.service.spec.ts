import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { WorkflowService } from './workflow.service';
import { ApprovalWorkflow } from '../entities/approval-workflow.entity';
import { ApprovalStep } from '../entities/approval-step.entity';

describe('WorkflowService', () => {
  let service: WorkflowService;
  let workflowRepo: jest.Mocked<Repository<ApprovalWorkflow>>;
  let stepRepo: jest.Mocked<Repository<ApprovalStep>>;

  const mockWorkflow = {
    id: 1,
    name: 'Test WF',
    isActive: true,
    moduleId: 1,
    module: { id: 1, name: 'PROJECTS' },
  } as ApprovalWorkflow;
  const mockSteps = [
    {
      id: 1,
      workflowId: 1,
      stepOrder: 1,
      departmentId: 1,
      roleId: 2,
      levelRank: 1,
      department: { id: 1, name: 'Engineering' },
      role: { id: 2, name: 'Manager' },
    } as ApprovalStep,
    {
      id: 2,
      workflowId: 1,
      stepOrder: 2,
      departmentId: 1,
      roleId: 3,
      levelRank: 2,
      department: { id: 1, name: 'Engineering' },
      role: { id: 3, name: 'Head' },
    } as ApprovalStep,
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowService,
        {
          provide: getRepositoryToken(ApprovalWorkflow),
          useValue: { find: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(ApprovalStep),
          useValue: { find: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<WorkflowService>(WorkflowService);
    workflowRepo = module.get(getRepositoryToken(ApprovalWorkflow));
    stepRepo = module.get(getRepositoryToken(ApprovalStep));
  });

  describe('findAll', () => {
    it('should return active workflows', async () => {
      workflowRepo.find.mockResolvedValue([mockWorkflow]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(workflowRepo.find).toHaveBeenCalledWith({
        where: { isActive: true },
      });
    });
  });

  describe('findById', () => {
    it('should return workflow by id', async () => {
      workflowRepo.findOne.mockResolvedValue(mockWorkflow);

      const result = await service.findById(1);

      expect(result).toEqual(mockWorkflow);
    });

    it('should throw NotFoundException when not found', async () => {
      workflowRepo.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSteps', () => {
    it('should return steps ordered by stepOrder', async () => {
      workflowRepo.findOne.mockResolvedValue(mockWorkflow);
      stepRepo.find.mockResolvedValue(mockSteps);

      const result = await service.getSteps(1);

      expect(result).toHaveLength(2);
      expect(stepRepo.find).toHaveBeenCalledWith({
        where: { workflowId: 1 },
        order: { stepOrder: 'ASC' },
        relations: { department: true, role: true },
      });
    });

    it('should throw if workflow not found', async () => {
      workflowRepo.findOne.mockResolvedValue(null);

      await expect(service.getSteps(999)).rejects.toThrow(NotFoundException);
    });
  });
});
