import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DelegationService } from './delegation.service';
import { UserDelegation } from '../entities/user-delegation.entity';
import { User } from '../../users/entities/user.entity';
import { NotificationService } from '../../notifications/services/notification.service';

describe('DelegationService', () => {
  let service: DelegationService;
  let delegationRepo: jest.Mocked<Repository<UserDelegation>>;
  let userRepo: jest.Mocked<Repository<User>>;
  let notifService: jest.Mocked<NotificationService>;

  const mockFromUser = { empId: 'PPL00001', isActive: true } as User;
  const mockToUser = { empId: 'PPL00002', isActive: true } as User;
  const mockDelegation = {
    id: 1,
    fromUserId: 'PPL00001',
    toUserId: 'PPL00002',
    moduleId: 1,
    startDate: new Date('2026-07-01'),
    endDate: new Date('2026-07-31'),
    reason: 'On leave',
    isActive: true,
  } as UserDelegation;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DelegationService,
        {
          provide: getRepositoryToken(UserDelegation),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: NotificationService,
          useValue: { sendToUser: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<DelegationService>(DelegationService);
    delegationRepo = module.get(getRepositoryToken(UserDelegation));
    userRepo = module.get(getRepositoryToken(User));
    notifService = module.get(NotificationService);
  });

  describe('create', () => {
    const dto = {
      fromUserId: 'PPL00001',
      toUserId: 'PPL00002',
      moduleId: 1,
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      reason: 'On leave',
    };

    it('should create delegation and notify both users', async () => {
      userRepo.findOne.mockResolvedValueOnce(mockFromUser);
      userRepo.findOne.mockResolvedValueOnce(mockToUser);
      delegationRepo.findOne.mockResolvedValue(null);
      delegationRepo.create.mockReturnValue(mockDelegation);
      delegationRepo.save.mockResolvedValue(mockDelegation);

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(notifService.sendToUser).toHaveBeenCalledTimes(2);
      expect(notifService.sendToUser).toHaveBeenCalledWith(
        'PPL00001',
        'Delegation Created',
        expect.any(String),
        'DELEGATION',
        '1',
        'DELEGATION',
        'HIGH',
      );
      expect(notifService.sendToUser).toHaveBeenCalledWith(
        'PPL00002',
        'Delegation Received',
        expect.any(String),
        'DELEGATION',
        '1',
        'DELEGATION',
        'HIGH',
      );
    });

    it('should reject self-delegation', async () => {
      await expect(
        service.create({ ...dto, toUserId: 'PPL00001' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if fromUser not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.create(dto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findById', () => {
    it('should return delegation by id', async () => {
      delegationRepo.findOne.mockResolvedValue(mockDelegation);

      const result = await service.findById(1);

      expect(result).toEqual(mockDelegation);
    });

    it('should throw if not found', async () => {
      delegationRepo.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated delegations', async () => {
      delegationRepo.findAndCount.mockResolvedValue([[mockDelegation], 1]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('update', () => {
    it('should update delegation fields', async () => {
      delegationRepo.findOne.mockResolvedValue(mockDelegation);
      delegationRepo.save.mockResolvedValue({
        ...mockDelegation,
        reason: 'Extended leave',
      });

      const result = await service.update(1, {
        reason: 'Extended leave',
      });

      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should soft delete delegation', async () => {
      delegationRepo.findOne.mockResolvedValue(mockDelegation);
      delegationRepo.save.mockResolvedValue(mockDelegation);

      await service.remove(1);

      expect(delegationRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ deletedAt: expect.any(Date) }),
      );
    });
  });
});
