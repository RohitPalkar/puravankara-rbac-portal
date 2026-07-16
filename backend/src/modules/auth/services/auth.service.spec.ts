import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { PasswordService } from './password.service';
import { User } from '../../users/entities/user.entity';
import { UserAuth } from '../entities/user-auth.entity';
import { UserSession } from '../entities/user-session.entity';
import { UserRole } from '../../users/entities/user-role.entity';
import { AuditService } from '../../audit/services/audit.service';
import { PermissionCompilerService } from '../../permissions/services/permission-compiler.service';
import { UserProjectAccess } from '../../project-access/entities/user-project-access.entity';
import { LoginDto } from '../dto/login.dto';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<Repository<User>>;
  let userAuthRepo: jest.Mocked<Repository<UserAuth>>;
  let userSessionRepo: jest.Mocked<Repository<UserSession>>;
  let tokenService: jest.Mocked<TokenService>;
  let passwordService: jest.Mocked<PasswordService>;
  let auditService: jest.Mocked<AuditService>;

  const mockUser = {
    empId: 'PPL00001',
    name: 'Test User',
    email: 'test@example.com',
    isActive: true,
    deletedAt: null,
    departmentId: 1,
    department: null,
  } as User;

  const mockUserAuth = {
    userId: 'PPL00001',
    passwordHash: '$2b$12$hashed',
    authProvider: 'LOCAL',
    isLocked: false,
    failedAttempts: 0,
    lastLogin: null,
  } as UserAuth;

  const mockSessionPayload = {
    sub: 'PPL00001',
    email: 'test@example.com',
    sessionId: 'session-1',
    roles: ['1'],
  };

  const mockTokens = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresIn: 900,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(UserAuth),
          useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn() },
        },
        {
          provide: getRepositoryToken(UserSession),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserRole),
          useValue: { find: jest.fn() },
        },
        {
          provide: TokenService,
          useValue: {
            createSessionPayload: jest.fn(),
            generateTokenPair: jest.fn(),
            verifyRefreshToken: jest.fn(),
          },
        },
        {
          provide: PasswordService,
          useValue: { comparePassword: jest.fn() },
        },
        {
          provide: AuditService,
          useValue: { createLog: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: getRepositoryToken(UserProjectAccess),
          useValue: { find: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: PermissionCompilerService,
          useValue: {
            compileForAllUserProjects: jest.fn().mockResolvedValue(undefined),
            getCompiled: jest.fn().mockResolvedValue({ modules: [] }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(getRepositoryToken(User));
    userAuthRepo = module.get(getRepositoryToken(UserAuth));
    userSessionRepo = module.get(getRepositoryToken(UserSession));
    userRoleRepo = module.get(getRepositoryToken(UserRole));
    tokenService = module.get(TokenService);
    passwordService = module.get(PasswordService);
    auditService = module.get(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'validPass123',
    };

    it('should return tokens on successful login', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      userAuthRepo.findOne.mockResolvedValue(mockUserAuth);
      jest.spyOn(passwordService, 'comparePassword').mockResolvedValue(true);
      userAuthRepo.save.mockResolvedValue({
        ...mockUserAuth,
        failedAttempts: 0,
      });
      jest.spyOn(userRoleRepo, 'find').mockResolvedValue([]);
      jest
        .spyOn(tokenService, 'createSessionPayload')
        .mockReturnValue(mockSessionPayload);
      jest.spyOn(tokenService, 'generateTokenPair').mockReturnValue(mockTokens);
      userSessionRepo.create.mockReturnValue({} as UserSession);
      userSessionRepo.save.mockResolvedValue({} as UserSession);

      const result = await service.login(loginDto, '127.0.0.1', 'test-agent');

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user.email).toBe('test@example.com');
      expect(auditService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'LOGIN_SUCCESS' }),
      );
    });

    it('should throw 401 when user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw 401 on wrong password and increment failedAttempts', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      userAuthRepo.findOne.mockResolvedValue(mockUserAuth);
      jest.spyOn(passwordService, 'comparePassword').mockResolvedValue(false);
      userAuthRepo.save.mockResolvedValue({
        ...mockUserAuth,
        failedAttempts: 1,
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userAuthRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ failedAttempts: 1 }),
      );
    });

    it('should lock account after 5 failed attempts', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      const nearLockUserAuth = { ...mockUserAuth, failedAttempts: 4 };
      userAuthRepo.findOne.mockResolvedValue(nearLockUserAuth);
      jest.spyOn(passwordService, 'comparePassword').mockResolvedValue(false);
      const savedAuth = {
        ...nearLockUserAuth,
        failedAttempts: 5,
        isLocked: true,
      };
      userAuthRepo.save.mockResolvedValue(savedAuth);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userAuthRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ isLocked: true }),
      );
      expect(auditService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'ACCOUNT_LOCKED' }),
      );
    });

    it('should throw 403 when account is locked', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      userAuthRepo.findOne.mockResolvedValue({
        ...mockUserAuth,
        isLocked: true,
      });

      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw 403 when user is inactive', async () => {
      userRepo.findOne.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('refresh', () => {
    it('should rotate tokens on valid refresh', async () => {
      jest
        .spyOn(tokenService, 'verifyRefreshToken')
        .mockReturnValue(mockSessionPayload);
      userSessionRepo.findOne.mockResolvedValue({
        id: 'session-1',
        userId: 'PPL00001',
        tokenHash: '',
      } as UserSession);
      const { compare } = jest.requireMock('bcrypt');
      compare.mockResolvedValue(true);
      userSessionRepo.delete.mockResolvedValue({ affected: 1 } as any);
      userRepo.findOne.mockResolvedValue(mockUser);
      jest.spyOn(userRoleRepo, 'find').mockResolvedValue([]);
      jest
        .spyOn(tokenService, 'createSessionPayload')
        .mockReturnValue(mockSessionPayload);
      jest.spyOn(tokenService, 'generateTokenPair').mockReturnValue(mockTokens);
      userSessionRepo.create.mockReturnValue({} as UserSession);
      userSessionRepo.save.mockResolvedValue({} as UserSession);

      const result = await service.refresh('valid-refresh-token');

      expect(result.accessToken).toBe('access-token');
    });

    it('should throw 401 when session not found', async () => {
      jest
        .spyOn(tokenService, 'verifyRefreshToken')
        .mockReturnValue(mockSessionPayload);
      userSessionRepo.findOne.mockResolvedValue(null);

      await expect(service.refresh('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should remove session and log audit', async () => {
      userSessionRepo.findOne.mockResolvedValue({
        id: 'session-1',
        userId: 'PPL00001',
      } as UserSession);
      userSessionRepo.delete.mockResolvedValue({ affected: 1 } as any);

      await service.logout('session-1');

      expect(userSessionRepo.delete).toHaveBeenCalledWith({ id: 'session-1' });
      expect(auditService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'LOGOUT' }),
      );
    });
  });

  describe('logoutAll', () => {
    it('should remove all sessions for user', async () => {
      userSessionRepo.delete.mockResolvedValue({ affected: 2 } as any);

      await service.logoutAll('PPL00001');

      expect(userSessionRepo.delete).toHaveBeenCalledWith({
        userId: 'PPL00001',
      });
      expect(auditService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'LOGOUT_ALL' }),
      );
    });
  });
});
