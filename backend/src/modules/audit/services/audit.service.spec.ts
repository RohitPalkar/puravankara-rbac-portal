import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditService } from './audit.service';
import { AuditLog } from '../entities/audit-log.entity';

describe('AuditService', () => {
  let service: AuditService;
  let auditRepo: jest.Mocked<Repository<AuditLog>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    auditRepo = module.get(getRepositoryToken(AuditLog));
  });

  describe('createLog', () => {
    it('should create an audit log entry', async () => {
      const dto = {
        entityName: 'USER',
        action: 'CREATED',
        entityId: '123',
        performedBy: 'PPL00001',
        source: 'USER',
      };
      const savedLog = { id: 1, ...dto } as AuditLog;
      auditRepo.create.mockReturnValue(savedLog);
      auditRepo.save.mockResolvedValue(savedLog);

      await service.createLog(dto);

      expect(auditRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          entityName: 'USER',
          action: 'CREATED',
          entityId: '123',
        }),
      );
      expect(auditRepo.save).toHaveBeenCalled();
    });

    it('should include ipAddress and userAgent when provided', async () => {
      const dto = {
        entityName: 'AUTH',
        action: 'LOGIN_SUCCESS',
        entityId: 'PPL00001',
        performedBy: 'PPL00001',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        source: 'AUTH',
      };
      auditRepo.create.mockReturnValue(dto as any);
      auditRepo.save.mockResolvedValue(dto as any);

      await service.createLog(dto);

      expect(auditRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        }),
      );
    });

    it('should handle newValue and oldValue as JSON', async () => {
      const dto = {
        entityName: 'PROJECT',
        action: 'UPDATED',
        entityId: '10',
        oldValue: { name: 'Old Project' },
        newValue: { name: 'New Project' },
        performedBy: 'PPL00001',
        source: 'PROJECT',
      };
      auditRepo.create.mockReturnValue(dto as any);
      auditRepo.save.mockResolvedValue(dto as any);

      await service.createLog(dto);

      expect(auditRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          oldValue: { name: 'Old Project' },
          newValue: { name: 'New Project' },
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated audit logs', async () => {
      const logs = [{ id: 1 } as AuditLog, { id: 2 } as AuditLog];
      auditRepo.findAndCount.mockResolvedValue([logs, 2]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });
  });
});
