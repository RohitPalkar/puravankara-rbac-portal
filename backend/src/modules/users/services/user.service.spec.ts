import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserRoleService } from '../services/user.service';
import { UserRole } from '../entities/user-role.entity';
import { NotificationService } from '../../notifications/services/notification.service';
import { PermissionCompilerService } from '../../permissions/services/permission-compiler.service';

describe('UserRoleService', () => {
  let service: UserRoleService;
  let userRoleRepo: jest.Mocked<Repository<UserRole>>;
  let notifService: jest.Mocked<NotificationService>;
  let compilerService: jest.Mocked<PermissionCompilerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRoleService,
        {
          provide: getRepositoryToken(UserRole),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: { sendToUser: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: PermissionCompilerService,
          useValue: { compileForAllUserProjects: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<UserRoleService>(UserRoleService);
    userRoleRepo = module.get(getRepositoryToken(UserRole));
    notifService = module.get(NotificationService);
    compilerService = module.get(PermissionCompilerService);
  });

  describe('assign', () => {
    const dto = {
      userId: 'PPL00002',
      departmentId: 1,
      roleId: 2,
      assignedBy: 'PPL00001',
    };
    const savedRole = { id: 1, ...dto } as UserRole;

    it('should assign role and send notification', async () => {
      userRoleRepo.findOne.mockResolvedValue(null);
      userRoleRepo.create.mockReturnValue(savedRole);
      userRoleRepo.save.mockResolvedValue(savedRole);

      const result = await service.assign(dto);

      expect(result).toBeDefined();
      expect(notifService.sendToUser).toHaveBeenCalledWith(
        'PPL00002',
        'Role Assigned',
        expect.any(String),
        'ROLE_ASSIGNMENT',
        '2',
        'ROLE',
        'HIGH',
      );
    });

    it('should throw ConflictException if role already assigned', async () => {
      userRoleRepo.findOne.mockResolvedValue(savedRole);

      await expect(service.assign(dto)).rejects.toThrow(ConflictException);
    });

    it('should not send notification on conflict', async () => {
      userRoleRepo.findOne.mockResolvedValue(savedRole);

      await expect(service.assign(dto)).rejects.toThrow(ConflictException);
      expect(notifService.sendToUser).not.toHaveBeenCalled();
    });

    it('should trigger permission compiler after assignment', async () => {
      userRoleRepo.findOne.mockResolvedValue(null);
      userRoleRepo.create.mockReturnValue(savedRole);
      userRoleRepo.save.mockResolvedValue(savedRole);

      await service.assign(dto);

      expect(compilerService.compileForAllUserProjects).toHaveBeenCalledWith('PPL00002');
    });
  });

  describe('findByUser', () => {
    it('should return roles for a user', async () => {
      const roles = [{ id: 1, userId: 'PPL00002' } as UserRole];
      userRoleRepo.find.mockResolvedValue(roles);

      const result = await service.findByUser('PPL00002');

      expect(result).toHaveLength(1);
      expect(userRoleRepo.find).toHaveBeenCalledWith({
        where: { userId: 'PPL00002' },
        relations: { role: true, department: true },
      });
    });
  });

  describe('revoke', () => {
    it('should delete the user role', async () => {
      userRoleRepo.delete.mockResolvedValue({ affected: 1 } as any);

      await service.revoke('PPL00002', 1, 2);

      expect(userRoleRepo.delete).toHaveBeenCalledWith({
        userId: 'PPL00002',
        departmentId: 1,
        roleId: 2,
      });
    });

    it('should trigger permission compiler after revoke', async () => {
      userRoleRepo.delete.mockResolvedValue({ affected: 1 } as any);

      await service.revoke('PPL00002', 1, 2);

      expect(compilerService.compileForAllUserProjects).toHaveBeenCalledWith('PPL00002');
    });
  });
});
