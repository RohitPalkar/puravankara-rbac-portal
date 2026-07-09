import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionService } from './permission.service';
import { PermissionCacheService } from './permission-cache.service';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/entities/user-role.entity';
import { Role } from '../../organization/entities/role.entity';
import { RoleProjectPermission } from '../entities/role-project-permission.entity';
import { UserPermissionTemplate } from '../entities/user-permission-template.entity';
import { TemplatePermission } from '../entities/template-permission.entity';
import { UserPermissionOverride } from '../entities/user-permission-override.entity';
import { UserProjectAccess } from '../../project-access/entities/user-project-access.entity';
import { UserProjectGroup } from '../../project-access/entities/user-project-group.entity';
import { ProjectGroupProject } from '../../project-access/entities/project-group-project.entity';
import { Module } from '../../product-catalog/entities/module.entity';
import { SubModule } from '../../product-catalog/entities/sub-module.entity';
import { Action } from '../../product-catalog/entities/action.entity';
import { PermissionCompilerService } from './permission-compiler.service';

describe('PermissionService', () => {
  let service: PermissionService;
  let userRepo: jest.Mocked<Repository<User>>;
  let userRoleRepo: jest.Mocked<Repository<UserRole>>;
  let rppRepo: jest.Mocked<Repository<RoleProjectPermission>>;
  let uptRepo: jest.Mocked<Repository<UserPermissionTemplate>>;
  let tpRepo: jest.Mocked<Repository<TemplatePermission>>;
  let upoRepo: jest.Mocked<Repository<UserPermissionOverride>>;
  let accessRepo: jest.Mocked<Repository<UserProjectAccess>>;
  let upgRepo: jest.Mocked<Repository<UserProjectGroup>>;
  let pgpRepo: jest.Mocked<Repository<ProjectGroupProject>>;
  let moduleRepo: jest.Mocked<Repository<Module>>;
  let actionRepo: jest.Mocked<Repository<Action>>;
  let cacheService: jest.Mocked<PermissionCacheService>;

  const context = {
    userId: 'PPL00002',
    projectId: 1,
    moduleCode: 'PROJECTS',
    actionCode: 'READ',
  };

  const mockUser = {
    empId: 'PPL00002',
    isActive: true,
    deletedAt: null,
  } as User;
  const mockAdminUser = {
    empId: 'PPL00001',
    isActive: true,
    deletedAt: null,
  } as User;
  const mockModule = { id: 1, name: 'PROJECTS', isActive: true } as Module;
  const mockAction = { id: 1, code: 'READ', isActive: true } as Action;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: getRepositoryToken(User),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(UserRole),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(Role),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(RoleProjectPermission),
          useValue: { find: jest.fn(), count: jest.fn() },
        },
        {
          provide: getRepositoryToken(UserPermissionTemplate),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(TemplatePermission),
          useValue: { count: jest.fn() },
        },
        {
          provide: getRepositoryToken(UserPermissionOverride),
          useValue: { find: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(UserProjectAccess),
          useValue: { find: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(UserProjectGroup),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(ProjectGroupProject),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(Module),
          useValue: { find: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(Action),
          useValue: { find: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(SubModule),
          useValue: { find: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: PermissionCacheService,
          useValue: { get: jest.fn(), set: jest.fn(), getCacheKey: jest.fn() },
        },
        {
          provide: PermissionCompilerService,
          useValue: { getCompiled: jest.fn(), compileForUser: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
    userRepo = module.get(getRepositoryToken(User));
    userRoleRepo = module.get(getRepositoryToken(UserRole));
    rppRepo = module.get(getRepositoryToken(RoleProjectPermission));
    uptRepo = module.get(getRepositoryToken(UserPermissionTemplate));
    tpRepo = module.get(getRepositoryToken(TemplatePermission));
    upoRepo = module.get(getRepositoryToken(UserPermissionOverride));
    accessRepo = module.get(getRepositoryToken(UserProjectAccess));
    upgRepo = module.get(getRepositoryToken(UserProjectGroup));
    pgpRepo = module.get(getRepositoryToken(ProjectGroupProject));
    moduleRepo = module.get(getRepositoryToken(Module));
    actionRepo = module.get(getRepositoryToken(Action));
    cacheService = module.get(PermissionCacheService);
  });

  describe('resolve', () => {
    it('should return DENY for missing context fields', async () => {
      const result = await service.resolve({
        userId: '',
        projectId: 0,
        moduleCode: '',
        actionCode: '',
      });
      expect(result.allowed).toBe(false);
    });

    it('should return DENY for inactive user', async () => {
      userRepo.findOne.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      const result = await service.resolve(context);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('inactive');
    });

    it('should return ALLOW for SUPER_ADMIN', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      userRoleRepo.find.mockResolvedValue([
        { userId: 'PPL00002', roleId: 1, role: { name: 'SUPER_ADMIN', id: 1 } },
      ] as any);

      const result = await service.resolve(context);
      expect(result.allowed).toBe(true);
      expect(result.source).toBe('super-admin');
    });

    it('should return DENY when user has no project access', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      userRoleRepo.find.mockResolvedValue([
        { userId: 'PPL00002', roleId: 2, role: { name: 'User', id: 2 } },
      ] as any);
      accessRepo.findOne.mockResolvedValue(null);
      upgRepo.find.mockResolvedValue([]);

      const result = await service.resolve(context);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('No project access');
    });

    it('should return ALLOW when role permission exists', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      userRoleRepo.find.mockResolvedValue([
        { userId: 'PPL00002', roleId: 1, role: { name: 'User', id: 1 } },
      ] as any);
      accessRepo.findOne.mockResolvedValue({ id: 1 } as UserProjectAccess);
      moduleRepo.findOne.mockResolvedValue(mockModule);
      actionRepo.findOne.mockResolvedValue(mockAction);
      upoRepo.findOne.mockResolvedValue(null);
      rppRepo.count.mockResolvedValue(1);

      const result = await service.resolve(context);
      expect(result.allowed).toBe(true);
      expect(result.source).toBe('role');
    });

    it('should return ALLOW when template permission exists', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      userRoleRepo.find.mockResolvedValue([
        { userId: 'PPL00002', roleId: 2, role: { name: 'User', id: 2 } },
      ] as any);
      accessRepo.findOne.mockResolvedValue({ id: 1 } as UserProjectAccess);
      moduleRepo.findOne.mockResolvedValue(mockModule);
      actionRepo.findOne.mockResolvedValue(mockAction);
      upoRepo.findOne.mockResolvedValue(null);
      rppRepo.count.mockResolvedValue(0);
      uptRepo.find.mockResolvedValue([
        {
          userId: 'PPL00002',
          projectId: 1,
          templateId: 1,
        } as UserPermissionTemplate,
      ]);
      tpRepo.count.mockResolvedValue(1);

      const result = await service.resolve(context);
      expect(result.allowed).toBe(true);
      expect(result.source).toBe('template');
    });

    it('should return DENY when user override says DENY', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      userRoleRepo.find.mockResolvedValue([
        { userId: 'PPL00002', roleId: 2, role: { name: 'User', id: 2 } },
      ] as any);
      accessRepo.findOne.mockResolvedValue({ id: 1 } as UserProjectAccess);
      moduleRepo.findOne.mockResolvedValue(mockModule);
      actionRepo.findOne.mockResolvedValue(mockAction);
      upoRepo.findOne.mockResolvedValue({
        userId: 'PPL00002',
        projectId: 1,
        moduleId: 1,
        actionId: 1,
        permissionType: 'DENY',
      } as UserPermissionOverride);
      rppRepo.count.mockResolvedValue(1);

      const result = await service.resolve(context);
      expect(result.allowed).toBe(false);
      expect(result.source).toBe('override');
    });

    it('should return DENY with default deny when nothing matches', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      userRoleRepo.find.mockResolvedValue([
        { userId: 'PPL00002', roleId: 2, role: { name: 'User', id: 2 } },
      ] as any);
      accessRepo.findOne.mockResolvedValue({ id: 1 } as UserProjectAccess);
      moduleRepo.findOne.mockResolvedValue(mockModule);
      actionRepo.findOne.mockResolvedValue(mockAction);
      upoRepo.findOne.mockResolvedValue(null);
      rppRepo.count.mockResolvedValue(0);
      uptRepo.find.mockResolvedValue([]);

      const result = await service.resolve(context);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('No matching permission');
    });
  });

  describe('explain', () => {
    it('should return step-by-step explanation', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      userRoleRepo.find.mockResolvedValue([]);
      accessRepo.findOne.mockResolvedValue({ id: 1 } as UserProjectAccess);
      moduleRepo.findOne.mockResolvedValue(mockModule);
      actionRepo.findOne.mockResolvedValue(mockAction);
      upoRepo.findOne.mockResolvedValue(null);
      rppRepo.count.mockResolvedValue(0);
      uptRepo.find.mockResolvedValue([]);

      const result = await service.explain(context);

      expect(result.allowed).toBe(false);
      expect(result.explanation.length).toBeGreaterThan(3);
      expect(result.explanation[0].step).toBe('USER_VALIDATION');
    });
  });
});
