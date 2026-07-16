import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { UserAuth } from '../entities/user-auth.entity';
import { UserSession } from '../entities/user-session.entity';
import { UserRole } from '../../users/entities/user-role.entity';
import { UserProjectAccess } from '../../project-access/entities/user-project-access.entity';
import { TokenService } from './token.service';
import { PasswordService } from './password.service';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { AuditService } from '../../audit/services/audit.service';
import { PermissionCompilerService } from '../../permissions/services/permission-compiler.service';

const MAX_FAILED_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserAuth)
    private readonly userAuthRepository: Repository<UserAuth>,
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(UserProjectAccess)
    private readonly accessRepo: Repository<UserProjectAccess>,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
    private readonly auditService: AuditService,
    private readonly compilerService: PermissionCompilerService,
  ) {}

  async login(
    dto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      await this.auditService.createLog({
        entityName: 'AUTH',
        action: 'LOGIN_FAILED',
        newValue: { email: dto.email },
        performedBy: dto.email,
        ipAddress,
        userAgent,
        source: 'AUTH',
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.deletedAt) {
      await this.auditService.createLog({
        entityName: 'AUTH',
        action: 'LOGIN_FAILED',
        newValue: { email: dto.email, reason: 'deleted' },
        performedBy: dto.email,
        ipAddress,
        userAgent,
        source: 'AUTH',
      });
      throw new UnauthorizedException('Account has been deactivated');
    }

    if (!user.isActive) {
      await this.auditService.createLog({
        entityName: 'AUTH',
        action: 'LOGIN_FAILED',
        newValue: { email: dto.email, reason: 'inactive' },
        performedBy: dto.email,
        ipAddress,
        userAgent,
        source: 'AUTH',
      });
      throw new ForbiddenException(
        'Account is inactive. Contact administrator.',
      );
    }

    const userAuth = await this.userAuthRepository.findOne({
      where: { userId: user.empId },
    });

    if (!userAuth) {
      throw new UnauthorizedException(
        'Account not configured. Contact administrator to set up your password.',
      );
    }

    if (userAuth.isLocked) {
      await this.auditService.createLog({
        entityName: 'AUTH',
        action: 'LOGIN_FAILED',
        entityId: user.empId,
        newValue: { reason: 'locked' },
        performedBy: user.empId,
        ipAddress,
        userAgent,
        source: 'AUTH',
      });
      throw new ForbiddenException(
        'Account is locked due to too many failed attempts. Contact administrator.',
      );
    }

    if (userAuth.authProvider !== 'LOCAL') {
      await this.auditService.createLog({
        entityName: 'AUTH',
        action: 'LOGIN_FAILED',
        entityId: user.empId,
        newValue: { reason: 'wrong_provider', provider: userAuth.authProvider },
        performedBy: user.empId,
        ipAddress,
        userAgent,
        source: 'AUTH',
      });
      throw new UnauthorizedException(
        `Please sign in with ${userAuth.authProvider} instead.`,
      );
    }

    const isPasswordValid = await this.passwordService.comparePassword(
      dto.password,
      userAuth.passwordHash || '',
    );

    if (!isPasswordValid) {
      userAuth.failedAttempts += 1;
      const wasLocked = userAuth.failedAttempts >= MAX_FAILED_ATTEMPTS;
      if (wasLocked) {
        userAuth.isLocked = true;
      }
      await this.userAuthRepository.save(userAuth);

      await this.auditService.createLog({
        entityName: 'AUTH',
        action: wasLocked ? 'ACCOUNT_LOCKED' : 'LOGIN_FAILED',
        entityId: user.empId,
        newValue: { failedAttempts: userAuth.failedAttempts },
        performedBy: user.empId,
        ipAddress,
        userAgent,
        source: 'AUTH',
      });

      throw new UnauthorizedException('Invalid email or password');
    }

    userAuth.failedAttempts = 0;
    userAuth.lastLogin = new Date();
    await this.userAuthRepository.save(userAuth);

    await this.auditService.createLog({
      entityName: 'AUTH',
      action: 'LOGIN_SUCCESS',
      entityId: user.empId,
      performedBy: user.empId,
      ipAddress,
      userAgent,
      source: 'AUTH',
    });

    const userRoles = await this.userRoleRepository.find({
      where: { userId: user.empId },
      relations: { role: true },
    });

    const roleIds = userRoles.map((ur) => String(ur.roleId));

    const payload = this.tokenService.createSessionPayload(
      user.empId,
      user.email,
      roleIds,
    );

    const tokens = this.tokenService.generateTokenPair(payload);

    await this.createSession(
      payload.sessionId,
      user.empId,
      tokens.refreshToken,
      ipAddress,
      userAgent,
    );

    let permissions: any = undefined;
    try {
      this.compilerService.compileForAllUserProjects(user.empId).catch(() => {});
      const accessRows = await this.accessRepo.find({
        where: { userId: user.empId },
        relations: { project: true },
        take: 1,
      });
      if (accessRows.length > 0) {
        const snapshot = await this.compilerService.getCompiled(
          user.empId,
          accessRows[0].projectId,
        );
        permissions = {
          projects: [{
            id: accessRows[0].projectId,
            name: accessRows[0].project.name,
            modules: snapshot.modules,
          }],
        };
      }
    } catch {
      // permissions are optional in login response
    }

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      user: {
        empId: user.empId,
        name: user.name,
        email: user.email,
        role: userRoles.length > 0 ? userRoles[0].role?.name || 'USER' : 'USER',
        roles: userRoles.map((ur) => ur.role?.name || 'USER'),
      },
      permissions,
    };
  }

  async refresh(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);

    const session = await this.userSessionRepository.findOne({
      where: { id: payload.sessionId },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    const isTokenValid = await bcrypt.compare(refreshToken, session.tokenHash);
    if (!isTokenValid) {
      await this.userSessionRepository.delete({ id: session.id });
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepository.findOne({
      where: { empId: payload.sub, isActive: true },
    });

    if (!user) {
      await this.userSessionRepository.delete({ id: session.id });
      throw new UnauthorizedException('User not found or inactive');
    }

    await this.userSessionRepository.delete({ id: session.id });

    const userRoles = await this.userRoleRepository.find({
      where: { userId: user.empId },
      relations: { role: true },
    });
    const roleIds = userRoles.map((ur) => String(ur.roleId));

    const newPayload = this.tokenService.createSessionPayload(
      user.empId,
      user.email,
      roleIds,
    );

    const tokens = this.tokenService.generateTokenPair(newPayload);

    await this.createSession(
      newPayload.sessionId,
      user.empId,
      tokens.refreshToken,
      ipAddress,
      userAgent,
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      user: {
        empId: user.empId,
        name: user.name,
        email: user.email,
        role: userRoles.length > 0 ? userRoles[0].role?.name || 'USER' : 'USER',
        roles: userRoles.map((ur) => ur.role?.name || 'USER'),
      },
    };
  }

  async logout(sessionId: string): Promise<void> {
    const session = await this.userSessionRepository.findOne({
      where: { id: sessionId },
    });
    await this.userSessionRepository.delete({ id: sessionId });

    if (session) {
      await this.auditService.createLog({
        entityName: 'AUTH',
        action: 'LOGOUT',
        entityId: session.userId,
        performedBy: session.userId,
        source: 'AUTH',
      });
    }
  }

  async logoutAll(empId: string): Promise<void> {
    await this.userSessionRepository.delete({ userId: empId });

    await this.auditService.createLog({
      entityName: 'AUTH',
      action: 'LOGOUT_ALL',
      entityId: empId,
      performedBy: empId,
      source: 'AUTH',
    });
  }

  async setInitialPassword(
    userId: string,
    password: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { empId: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const passwordHash = await bcrypt.hash(password, 10);

    let userAuth = await this.userAuthRepository.findOne({
      where: { userId },
    });

    if (userAuth) {
      userAuth.passwordHash = passwordHash;
      userAuth.failedAttempts = 0;
      userAuth.isLocked = false;
      await this.userAuthRepository.save(userAuth);
    } else {
      await this.userAuthRepository.save(
        this.userAuthRepository.create({
          userId,
          passwordHash,
          authProvider: 'LOCAL',
        }),
      );
    }
  }

  async getProfile(empId: string) {
    const user = await this.userRepository.findOne({
      where: { empId },
      relations: { department: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const userRoles = await this.userRoleRepository.find({
      where: { userId: empId },
      relations: { role: true, department: true },
    });

    return {
      user: {
        empId: user.empId,
        name: user.name,
        email: user.email,
        departmentId: user.departmentId,
        department: user.department?.name || null,
        employmentStatus: user.employmentStatus,
      },
      roles: userRoles.map((ur) => ({
        roleId: ur.roleId,
        roleName: ur.role?.name,
        departmentId: ur.departmentId,
        departmentName: ur.department?.name,
      })),
    };
  }

  private async createSession(
    sessionId: string,
    userId: string,
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const tokenHash = await bcrypt.hash(refreshToken, 10);

    const session = this.userSessionRepository.create({
      id: sessionId,
      userId,
      tokenHash,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await this.userSessionRepository.save(session);
  }
}
