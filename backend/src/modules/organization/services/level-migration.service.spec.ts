import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { LevelMigrationService } from './level-migration.service';
import { RoleMigrationService } from './role-migration.service';
import { AuditService } from '../../audit/services/audit.service';
import { PermissionCacheService } from '../../permissions/services/permission-cache.service';
import { Department } from '../entities/department.entity';
import { DepartmentHierarchyLevel } from '../entities/department-hierarchy-level.entity';
import { DepartmentZoneMapping } from '../entities/department-zone-mapping.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../../users/entities/user-role.entity';
import { RoleActionPermission } from '../../permissions/entities/role-action-permission.entity';
import { RoleProjectPermission } from '../../permissions/entities/role-project-permission.entity';
import { ApprovalStep } from '../../workflows/entities/approval-step.entity';
import { UserReportingLine } from '../../users/entities/user-reporting-line.entity';

describe('LevelMigrationService', () => {
  let service: LevelMigrationService;
  let deptRepo: jest.Mocked<Repository<Department>>;
  let levelRepo: jest.Mocked<Repository<DepartmentHierarchyLevel>>;
  let zoneMappingRepo: jest.Mocked<Repository<DepartmentZoneMapping>>;
  let roleRepo: jest.Mocked<Repository<Role>>;
  let userRoleRepo: jest.Mocked<Repository<UserRole>>;
  let rapRepo: jest.Mocked<Repository<RoleActionPermission>>;
  let rppRepo: jest.Mocked<Repository<RoleProjectPermission>>;
  let approvalStepRepo: jest.Mocked<Repository<ApprovalStep>>;
  let reportingLineRepo: jest.Mocked<Repository<UserReportingLine>>;
  let roleMigrationService: jest.Mocked<RoleMigrationService>;
  let auditService: jest.Mocked<AuditService>;
  let cacheService: jest.Mocked<PermissionCacheService>;

  const mockDept = { id: 1, name: 'Finance', maxHierarchyLevels: 3, isActive: true, departmentAdminId: null } as Department;
  const mockLevels = [
    { id: 10, departmentId: 1, levelNumber: 1, roleName: 'Approver', roleId: 71, isActive: true, displayOrder: 1 } as DepartmentHierarchyLevel,
    { id: 11, departmentId: 1, levelNumber: 2, roleName: 'Verifier', roleId: 72, isActive: true, displayOrder: 2 } as DepartmentHierarchyLevel,
    { id: 12, departmentId: 1, levelNumber: 3, roleName: 'Head', roleId: 73, isActive: true, displayOrder: 3 } as DepartmentHierarchyLevel,
  ];
  const mockZones = [
    { id: 1, departmentId: 1, zoneId: 1, zone: { id: 1, name: 'West' } } as any,
    { id: 2, departmentId: 1, zoneId: 2, zone: { id: 2, name: 'East' } } as any,
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LevelMigrationService,
        {
          provide: getRepositoryToken(Department),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DepartmentHierarchyLevel),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DepartmentZoneMapping),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Role),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserRole),
          useValue: {
            count: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RoleActionPermission),
          useValue: {
            count: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RoleProjectPermission),
          useValue: {
            count: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ApprovalStep),
          useValue: {
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserReportingLine),
          useValue: {
            count: jest.fn(),
          },
        },
        {
          provide: RoleMigrationService,
          useValue: {
            remove: jest.fn(),
          },
        },
        {
          provide: AuditService,
          useValue: {
            createLog: jest.fn(),
          },
        },
        {
          provide: PermissionCacheService,
          useValue: {
            invalidateByPattern: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LevelMigrationService>(LevelMigrationService);
    deptRepo = module.get(getRepositoryToken(Department));
    levelRepo = module.get(getRepositoryToken(DepartmentHierarchyLevel));
    zoneMappingRepo = module.get(getRepositoryToken(DepartmentZoneMapping));
    roleRepo = module.get(getRepositoryToken(Role));
    userRoleRepo = module.get(getRepositoryToken(UserRole));
    rapRepo = module.get(getRepositoryToken(RoleActionPermission));
    rppRepo = module.get(getRepositoryToken(RoleProjectPermission));
    approvalStepRepo = module.get(getRepositoryToken(ApprovalStep));
    reportingLineRepo = module.get(getRepositoryToken(UserReportingLine));
    roleMigrationService = module.get(RoleMigrationService);
    auditService = module.get(AuditService);
    cacheService = module.get(PermissionCacheService);
  });

  describe('getImpactPreview', () => {
    it('should throw NotFoundException for invalid department', async () => {
      deptRepo.findOne.mockResolvedValue(null);
      await expect(service.getImpactPreview(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for invalid level', async () => {
      deptRepo.findOne.mockResolvedValue(mockDept);
      levelRepo.findOne.mockResolvedValue(null);
      await expect(service.getImpactPreview(1, 99)).rejects.toThrow(NotFoundException);
    });

    it('should return impact preview with zero dependencies', async () => {
      deptRepo.findOne.mockResolvedValue(mockDept);
      levelRepo.findOne.mockResolvedValue(mockLevels[1]);
      zoneMappingRepo.find.mockResolvedValue(mockZones);
      userRoleRepo.count.mockResolvedValue(0);
      rapRepo.count.mockResolvedValue(0);
      rppRepo.count.mockResolvedValue(0);
      approvalStepRepo.count.mockResolvedValue(0);
      reportingLineRepo.count.mockResolvedValue(0);
      rapRepo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      } as any);
      rppRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ count: '0' }),
      } as any);
      levelRepo.find.mockResolvedValue(mockLevels);
      userRoleRepo.findOne.mockResolvedValue(null);

      const result = await service.getImpactPreview(1, 2);
      expect(result.department.name).toBe('Finance');
      expect(result.dependencies.users.count).toBe(0);
      expect(result.dependencies.permissions.count).toBe(0);
      expect(result.autoMerge.eligible).toBe(true);
      expect(result.protected).toBe(false);
    });

    it('should return impact preview with existing dependencies', async () => {
      deptRepo.findOne.mockResolvedValue(mockDept);
      levelRepo.findOne.mockResolvedValue(mockLevels[1]);
      zoneMappingRepo.find.mockResolvedValue(mockZones);
      userRoleRepo.count.mockResolvedValue(5);
      rapRepo.count.mockResolvedValue(10);
      rppRepo.count.mockResolvedValue(3);
      approvalStepRepo.count.mockResolvedValue(2);
      reportingLineRepo.count.mockResolvedValue(1);
      rapRepo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([{ moduleId: 1, count: '10' }]),
      } as any);
      rppRepo.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ count: '3' }),
      } as any);
      levelRepo.find.mockResolvedValue(mockLevels);
      userRoleRepo.findOne.mockResolvedValue(null);

      const result = await service.getImpactPreview(1, 2);
      expect(result.dependencies.users.count).toBe(5);
      expect(result.dependencies.permissions.count).toBe(13);
      expect(result.dependencies.projects.count).toBe(3);
      expect(result.autoMerge.eligible).toBe(false);
      expect(result.availableDestinations).toHaveLength(2);
    });
  });

  describe('remove', () => {
    it('should throw BadRequestException for self-merge', async () => {
      deptRepo.findOne.mockResolvedValue(mockDept);
      levelRepo.findOne.mockResolvedValue(mockLevels[1]);
      levelRepo.find.mockResolvedValue(mockLevels);
      userRoleRepo.count.mockResolvedValue(0);
      rapRepo.count.mockResolvedValue(0);
      rppRepo.count.mockResolvedValue(0);
      approvalStepRepo.count.mockResolvedValue(0);
      reportingLineRepo.count.mockResolvedValue(0);
      rapRepo.createQueryBuilder.mockReturnValue({ select: jest.fn().mockReturnThis(), addSelect: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), groupBy: jest.fn().mockReturnThis(), getRawMany: jest.fn().mockResolvedValue([]) } as any);
      rppRepo.createQueryBuilder.mockReturnValue({ where: jest.fn().mockReturnThis(), select: jest.fn().mockReturnThis(), getRawOne: jest.fn().mockResolvedValue({ count: '0' }) } as any);
      levelRepo.find.mockResolvedValueOnce(mockLevels);
      levelRepo.find.mockResolvedValueOnce(mockLevels);
      userRoleRepo.findOne.mockResolvedValue(null);

      await expect(
        service.remove(1, 2, { mode: 'MERGE', destinationLevelNumber: 2 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid destination', async () => {
      deptRepo.findOne.mockResolvedValue(mockDept);
      levelRepo.findOne.mockResolvedValue(mockLevels[1]);
      levelRepo.find.mockResolvedValue(mockLevels);
      userRoleRepo.count.mockResolvedValue(0);
      rapRepo.count.mockResolvedValue(0);
      rppRepo.count.mockResolvedValue(0);
      approvalStepRepo.count.mockResolvedValue(0);
      reportingLineRepo.count.mockResolvedValue(0);
      rapRepo.createQueryBuilder.mockReturnValue({ select: jest.fn().mockReturnThis(), addSelect: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), groupBy: jest.fn().mockReturnThis(), getRawMany: jest.fn().mockResolvedValue([]) } as any);
      rppRepo.createQueryBuilder.mockReturnValue({ where: jest.fn().mockReturnThis(), select: jest.fn().mockReturnThis(), getRawOne: jest.fn().mockResolvedValue({ count: '0' }) } as any);
      levelRepo.find.mockResolvedValueOnce(mockLevels);
      levelRepo.find.mockResolvedValueOnce(mockLevels);
      userRoleRepo.findOne.mockResolvedValue(null);

      await expect(
        service.remove(1, 2, { mode: 'MERGE', destinationLevelNumber: 99 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should perform merge successfully', async () => {
      deptRepo.findOne.mockResolvedValue(mockDept);
      levelRepo.findOne.mockResolvedValue(mockLevels[1]);
      levelRepo.find.mockResolvedValue(mockLevels);
      userRoleRepo.count.mockResolvedValue(0);
      rapRepo.count.mockResolvedValue(0);
      rppRepo.count.mockResolvedValue(0);
      approvalStepRepo.count.mockResolvedValue(0);
      reportingLineRepo.count.mockResolvedValue(0);
      rapRepo.createQueryBuilder.mockReturnValue({ select: jest.fn().mockReturnThis(), addSelect: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), groupBy: jest.fn().mockReturnThis(), getRawMany: jest.fn().mockResolvedValue([]) } as any);
      rppRepo.createQueryBuilder.mockReturnValue({ where: jest.fn().mockReturnThis(), select: jest.fn().mockReturnThis(), getRawOne: jest.fn().mockResolvedValue({ count: '0' }) } as any);
      levelRepo.find.mockResolvedValueOnce(mockLevels);
      levelRepo.find.mockResolvedValueOnce(mockLevels);
      userRoleRepo.findOne.mockResolvedValue(null);
      userRoleRepo.find.mockResolvedValue([]);
      roleMigrationService.remove.mockResolvedValue({
        message: 'Roles merged successfully',
        destinationRole: { id: 73, name: 'Head' },
      } as any);
      zoneMappingRepo.find.mockResolvedValue(mockZones);

      const result = await service.remove(1, 2, { mode: 'MERGE', destinationLevelNumber: 3 });

      expect(result.mode).toBe('MERGE');
      expect(result.destinationLevel.levelNumber).toBe(3);
      expect(result.sourceLevel.levelNumber).toBe(2);
      expect(roleMigrationService.remove).toHaveBeenCalledWith(
        72,
        { mode: 'MERGE', destinationRoleId: 73 },
        undefined,
      );
      expect(levelRepo.update).toHaveBeenCalledWith(11, { isActive: false });
      expect(auditService.createLog).toHaveBeenCalled();
    });

    it('should perform replace successfully', async () => {
      deptRepo.findOne.mockResolvedValue(mockDept);
      levelRepo.findOne.mockResolvedValue(mockLevels[1]);
      levelRepo.find.mockResolvedValue(mockLevels);
      userRoleRepo.count.mockResolvedValue(0);
      rapRepo.count.mockResolvedValue(0);
      rppRepo.count.mockResolvedValue(0);
      approvalStepRepo.count.mockResolvedValue(0);
      reportingLineRepo.count.mockResolvedValue(0);
      rapRepo.createQueryBuilder.mockReturnValue({ select: jest.fn().mockReturnThis(), addSelect: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), groupBy: jest.fn().mockReturnThis(), getRawMany: jest.fn().mockResolvedValue([]) } as any);
      rppRepo.createQueryBuilder.mockReturnValue({ where: jest.fn().mockReturnThis(), select: jest.fn().mockReturnThis(), getRawOne: jest.fn().mockResolvedValue({ count: '0' }) } as any);
      levelRepo.find.mockResolvedValueOnce(mockLevels);
      levelRepo.find.mockResolvedValueOnce(mockLevels);
      userRoleRepo.findOne.mockResolvedValue(null);
      userRoleRepo.find.mockResolvedValue([]);
      roleMigrationService.remove.mockResolvedValue({
        message: 'Roles replaced successfully',
        destinationRole: { id: 71, name: 'Approver' },
      } as any);
      zoneMappingRepo.find.mockResolvedValue(mockZones);

      const result = await service.remove(1, 2, { mode: 'REPLACE', destinationLevelNumber: 1 });

      expect(result.mode).toBe('REPLACE');
      expect(roleMigrationService.remove).toHaveBeenCalledWith(
        72,
        { mode: 'REPLACE', destinationRoleId: 71 },
        undefined,
      );
      expect(auditService.createLog).toHaveBeenCalled();
    });
  });

  describe('checkAutoMerge', () => {
    it('should return autoMerge=false when level has dependencies', async () => {
      deptRepo.findOne.mockResolvedValue(mockDept);
      levelRepo.findOne.mockResolvedValue(mockLevels[1]);
      zoneMappingRepo.find.mockResolvedValue(mockZones);
      userRoleRepo.count.mockResolvedValue(5);
      rapRepo.count.mockResolvedValue(10);
      rppRepo.count.mockResolvedValue(0);
      approvalStepRepo.count.mockResolvedValue(0);
      reportingLineRepo.count.mockResolvedValue(0);
      rapRepo.createQueryBuilder.mockReturnValue({ select: jest.fn().mockReturnThis(), addSelect: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), groupBy: jest.fn().mockReturnThis(), getRawMany: jest.fn().mockResolvedValue([]) } as any);
      rppRepo.createQueryBuilder.mockReturnValue({ where: jest.fn().mockReturnThis(), select: jest.fn().mockReturnThis(), getRawOne: jest.fn().mockResolvedValue({ count: '0' }) } as any);
      levelRepo.find.mockResolvedValue(mockLevels);
      userRoleRepo.findOne.mockResolvedValue(null);

      const result = await service.checkAutoMerge(1, 2);
      expect(result.autoMerge).toBe(false);
    });

    it('should auto-merge empty level', async () => {
      const preview = {
        autoMerge: { eligible: true, candidateLevel: { id: 12, levelNumber: 3, roleName: 'Head' }, direction: 'up' },
        sourceLevel: { id: 11, levelNumber: 2, roleName: 'Verifier', roleId: 72 },
        department: { id: 1, name: 'Finance', zones: [] },
        dependencies: { users: { count: 0 }, permissions: { count: 0 }, projects: { count: 0 }, approvals: { count: 0, active: 0 }, reporting: { count: 0 }, isDepartmentAdmin: false },
        protected: false, protectionReason: null,
        availableDestinations: [],
      };
      jest.spyOn(service, 'getImpactPreview').mockResolvedValue(preview);

      const result = await service.checkAutoMerge(1, 2);
      expect(result.autoMerge).toBe(true);
      expect(result.destinationLevel?.levelNumber).toBe(3);
      expect(result.destinationLevel?.roleName).toBe('Head');
    });
  });
});
