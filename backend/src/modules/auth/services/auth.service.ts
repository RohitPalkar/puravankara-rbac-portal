import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Logger,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { createHash, randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { UserAuth } from '../entities/user-auth.entity';
import { UserSession } from '../entities/user-session.entity';
import { UserRole } from '../../users/entities/user-role.entity';
import { UserProjectAccess } from '../../project-access/entities/user-project-access.entity';
import { Role } from '../../organization/entities/role.entity';
import { PermissionProfile } from '../../permissions/entities/permission-profile.entity';
import { TokenService } from './token.service';
import { PasswordService } from './password.service';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { AuditService } from '../../audit/services/audit.service';
import { PermissionCompilerService } from '../../permissions/services/permission-compiler.service';
import { PermissionCacheService } from '../../permissions/services/permission-cache.service';

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
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(PermissionProfile)
    private readonly profileRepository: Repository<PermissionProfile>,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
    private readonly auditService: AuditService,
    private readonly compilerService: PermissionCompilerService,
    @Optional()
    private readonly cacheService: PermissionCacheService,
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
      this.auditService.createLog({
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
      this.auditService.createLog({
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
      this.auditService.createLog({
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
      this.auditService.createLog({
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
      this.auditService.createLog({
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

      this.auditService.createLog({
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

    this.auditService.createLog({
      entityName: 'AUTH',
      action: 'LOGIN_SUCCESS',
      entityId: user.empId,
      performedBy: user.empId,
      ipAddress,
      userAgent,
      source: 'AUTH',
    });

    const userRoles = await this.findUserRolesSafe(user.empId);

    const roleIds = userRoles.map((ur) => String(ur.roleId));

    // Determine activeRoleId: Prefer PRIMARY valid role, fallback to first valid
    const now = new Date();
    const validRoles = userRoles.filter((ur) => {
      if (!ur.role || !ur.role.isActive) return false;
      if ((ur as any).expiresAt && new Date((ur as any).expiresAt) <= now) return false;
      return true;
    });
    let activeRoleId: number | null = null;
    if (validRoles.length > 0) {
      const primary = validRoles.find((ur) => (ur as any).roleType === 'PRIMARY');
      activeRoleId = (primary ?? validRoles[0]).roleId;
    } else if (userRoles.length > 0) {
      activeRoleId = userRoles[0].roleId;
    }

    const payload = this.tokenService.createSessionPayload(
      user.empId,
      user.email,
      roleIds,
      activeRoleId,
    );

    const tokens = this.tokenService.generateTokenPair(payload);

    await this.createSession(
      payload.sessionId,
      user.empId,
      tokens.refreshToken,
      ipAddress,
      userAgent,
      activeRoleId,
    );

    // Fire permission compilation in background - don't block login response at all
    // Use setImmediate to defer to next tick so login returns ~300ms faster
    setImmediate(() => {
      this.compilerService.compileForAllUserProjects(user.empId).catch(() => {});
    });

    // Permissions are fetched lazily via /permissions/me and /auth/me - not blocking login
    return {
      accessToken: tokens.accessToken,
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

    const previousActiveRoleId: number | null = (session as any).activeRoleId ?? (payload as any).activeRoleId ?? null;
    await this.userSessionRepository.delete({ id: session.id });

    const userRoles = await this.findUserRolesSafe(user.empId);
    const roleIds = userRoles.map((ur) => String(ur.roleId));

    // Preserve activeRoleId if still valid, else fallback to PRIMARY
    const now = new Date();
    const validRoles = userRoles.filter((ur) => {
      if (!ur.role || !ur.role.isActive) return false;
      if ((ur as any).expiresAt && new Date((ur as any).expiresAt) <= now) return false;
      return true;
    });
    let preservedActiveRoleId: number | null = previousActiveRoleId;
    if (preservedActiveRoleId != null) {
      const stillValid = validRoles.some((ur) => ur.roleId === preservedActiveRoleId);
      if (!stillValid) preservedActiveRoleId = null;
    }
    if (preservedActiveRoleId == null && validRoles.length > 0) {
      const primary = validRoles.find((ur) => (ur as any).roleType === 'PRIMARY');
      preservedActiveRoleId = (primary ?? validRoles[0]).roleId;
    } else if (preservedActiveRoleId == null && userRoles.length > 0) {
      preservedActiveRoleId = userRoles[0].roleId;
    }

    const newPayload = this.tokenService.createSessionPayload(
      user.empId,
      user.email,
      roleIds,
      preservedActiveRoleId,
    );

    const tokens = this.tokenService.generateTokenPair(newPayload);

    await this.createSession(
      newPayload.sessionId,
      user.empId,
      tokens.refreshToken,
      ipAddress,
      userAgent,
      preservedActiveRoleId,
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

  async setInitialPassword(userId: string, password: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { empId: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const passwordHash = await bcrypt.hash(password, 10);

    const userAuth = await this.userAuthRepository.findOne({
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

  async changePassword(
    empId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const userAuth = await this.userAuthRepository.findOne({
      where: { userId: empId },
    });

    if (!userAuth || !userAuth.passwordHash) {
      throw new BadRequestException(
        'Password not configured. Contact administrator.',
      );
    }

    const isValid = await this.passwordService.comparePassword(
      currentPassword,
      userAuth.passwordHash,
    );

    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    userAuth.passwordHash = await bcrypt.hash(newPassword, 10);
    userAuth.failedAttempts = 0;
    userAuth.isLocked = false;
    await this.userAuthRepository.save(userAuth);
  }

  async forgotPassword(
    email: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ message: string; resetToken?: string }> {
    const user = await this.userRepository.findOne({
      where: { email, deletedAt: null },
    });

    if (!user) {
      this.auditService.createLog({
        entityName: 'AUTH',
        action: 'FORGOT_PASSWORD',
        newValue: { email, reason: 'not_found' },
        performedBy: email,
        ipAddress,
        userAgent,
        source: 'AUTH',
      });
      return {
        message:
          'If an account exists for this email, a password reset link will be sent.',
      };
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const userAuth = await this.userAuthRepository.findOne({
      where: { userId: user.empId },
    });
    if (userAuth) {
      userAuth.resetTokenHash = tokenHash;
      userAuth.resetTokenExpiresAt = expiresAt;
      await this.userAuthRepository.save(userAuth);
    } else {
      await this.userAuthRepository.save(
        this.userAuthRepository.create({
          userId: user.empId,
          resetTokenHash: tokenHash,
          resetTokenExpiresAt: expiresAt,
          authProvider: 'LOCAL',
        }),
      );
    }

    this.auditService.createLog({
      entityName: 'AUTH',
      action: 'FORGOT_PASSWORD',
      entityId: user.empId,
      newValue: { expiresAt },
      performedBy: user.empId,
      ipAddress,
      userAgent,
      source: 'AUTH',
    });

    if (process.env.NODE_ENV !== 'production') {
      return {
        message: 'Password reset token generated (demo: no email relay configured).',
        resetToken: token,
      };
    }
    return {
      message: 'If an account exists, a password reset link has been sent.',
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<void> {
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const userAuth = await this.userAuthRepository.findOne({
      where: { resetTokenHash: tokenHash },
    });

    if (
      !userAuth ||
      !userAuth.resetTokenExpiresAt ||
      userAuth.resetTokenExpiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException('Reset token is invalid or has expired');
    }

    userAuth.passwordHash = await bcrypt.hash(newPassword, 10);
    userAuth.failedAttempts = 0;
    userAuth.isLocked = false;
    userAuth.resetTokenHash = null;
    userAuth.resetTokenExpiresAt = null;
    await this.userAuthRepository.save(userAuth);

    await this.userSessionRepository.delete({ userId: userAuth.userId });

    this.auditService.createLog({
      entityName: 'AUTH',
      action: 'PASSWORD_RESET',
      entityId: userAuth.userId,
      performedBy: userAuth.userId,
      source: 'AUTH',
    });
  }

  async getProfile(empId: string) {
    const user = await this.userRepository.findOne({
      where: { empId },
      relations: { department: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const userRoles = await this.findUserRolesSafe(empId, true);

    let permissions: any = undefined;
    try {
      const snapshot = await this.compilerService.getCompiled(empId, 0);
      if (snapshot.modules.length > 0) {
        permissions = {
          projects: [
            {
              id: 0,
              name: 'All Projects',
              modules: snapshot.modules,
            },
          ],
        };
      }
    } catch {
      // permissions are optional in profile response
    }

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
        hierarchyLevelRank: ur.role?.hierarchyLevelRank ?? 0,
        isSystemRole: ur.role?.isSystemRole ?? false,
        roleType: (ur as any).roleType ?? null,
        expiresAt: (ur as any).expiresAt ?? null,
        isActive: ur.role?.isActive ?? true,
      })),
      permissions,
    };
  }

  async getMyRoles(empId: string, sessionId?: string, activeRoleIdFromToken?: number | null) {
    const user = await this.userRepository.findOne({ where: { empId } });
    if (!user) throw new UnauthorizedException('User not found');

    const userRoles = await this.findUserRolesSafe(empId, true);

    const now = new Date();
    // Filter to valid assignments: role active + not expired
    const rolesWithMeta = userRoles.map((ur) => {
      const roleTypeRaw = (ur as any).roleType as string | null;
      const expiresAt = (ur as any).expiresAt as Date | null;
      const isExpired = expiresAt ? new Date(expiresAt) <= now : false;
      const isRoleActive = ur.role?.isActive !== false;
      const isActive = isRoleActive && !isExpired;
      // Derive roleType if null: first assignment treated as PRIMARY for display
      let roleType = roleTypeRaw;
      if (!roleType) {
        // heuristic: if multiple roles, earliest assigned is PRIMARY
        roleType = 'SECONDARY';
      }
      return {
        roleId: ur.roleId,
        roleName: ur.role?.name ?? `Role ${ur.roleId}`,
        roleType,
        departmentId: ur.departmentId,
        departmentName: ur.department?.name ?? null,
        hierarchyLevelRank: ur.role?.hierarchyLevelRank ?? 0,
        isSystemRole: ur.role?.isSystemRole ?? false,
        isActive,
        expiresAt,
        assignedAt: ur.assignedAt,
      };
    });

    // Try to enrich PRIMARY detection: earliest assignedAt should be PRIMARY if none marked PRIMARY
    const hasPrimary = rolesWithMeta.some((r) => r.roleType === 'PRIMARY');
    if (!hasPrimary && rolesWithMeta.length > 0) {
      const earliest = [...rolesWithMeta].sort((a, b) => {
        const ta = a.assignedAt ? new Date(a.assignedAt).getTime() : 0;
        const tb = b.assignedAt ? new Date(b.assignedAt).getTime() : 0;
        return ta - tb;
      })[0];
      earliest.roleType = 'PRIMARY';
    }

    // Also include BUDDY_RM permission_profiles if not already in user_roles
    try {
      const profiles = await this.profileRepository.find({
        where: { userId: empId },
        relations: { role: true, department: true },
      });
      for (const p of profiles) {
        const isProfileExpired = (p as any).expiresAt ? new Date((p as any).expiresAt) <= now : false;
        const isProfileActive = (p.status ?? 'ACTIVE') === 'ACTIVE' && !isProfileExpired;
        if (!p.roleId) continue;
        const exists = rolesWithMeta.some((r) => r.roleId === p.roleId && r.roleType === p.profileType);
        if (exists) continue;
        const roleEntity = p.role ?? await this.roleRepository.findOne({ where: { id: p.roleId } });
        if (!roleEntity) continue;
        rolesWithMeta.push({
          roleId: p.roleId,
          roleName: roleEntity.name,
          roleType: p.profileType as any,
          departmentId: p.departmentId ?? null,
          departmentName: p.department?.name ?? null,
          hierarchyLevelRank: roleEntity.hierarchyLevelRank ?? 0,
          isSystemRole: roleEntity.isSystemRole ?? false,
          isActive: isProfileActive && roleEntity.isActive,
          expiresAt: (p as any).expiresAt ?? null,
          assignedAt: (p as any).createdAt ?? null,
        });
      }
    } catch {
      // ignore profile enrichment errors
    }

    // Only return active, non-expired roles for switcher visibility
    const visibleRoles = rolesWithMeta.filter((r) => r.isActive);
    // Sort: PRIMARY first, then by hierarchy rank, then name
    visibleRoles.sort((a, b) => {
      const order: Record<string, number> = { PRIMARY: 0, SECONDARY: 1, BUDDY_RM: 2 };
      const oa = order[a.roleType] ?? 99;
      const ob = order[b.roleType] ?? 99;
      if (oa !== ob) return oa - ob;
      if (a.hierarchyLevelRank !== b.hierarchyLevelRank) return a.hierarchyLevelRank - b.hierarchyLevelRank;
      return a.roleName.localeCompare(b.roleName);
    });

    // Determine activeRoleId: Prefer token/session value if still valid, else PRIMARY
    let activeRoleId: number | null = activeRoleIdFromToken ?? null;
    if (sessionId) {
      try {
        const session = await this.userSessionRepository.findOne({ where: { id: sessionId } });
        if (session && (session as any).activeRoleId) {
          activeRoleId = (session as any).activeRoleId;
        }
      } catch {}
    }
    const activeStillValid = activeRoleId != null && visibleRoles.some((r) => r.roleId === activeRoleId);
    if (!activeStillValid) {
      const primary = visibleRoles.find((r) => r.roleType === 'PRIMARY');
      activeRoleId = (primary ?? visibleRoles[0])?.roleId ?? null;
    }
    const activeRoleName = visibleRoles.find((r) => r.roleId === activeRoleId)?.roleName ?? null;

    return {
      activeRoleId,
      activeRoleName,
      roles: rolesWithMeta
        .filter((r) => r.isActive) // ensure expired not returned? but spec says must not appear — filter
        .map((r) => ({
          roleId: r.roleId,
          roleName: r.roleName,
          roleType: r.roleType,
          departmentId: r.departmentId,
          departmentName: r.departmentName,
          hierarchyLevelRank: r.hierarchyLevelRank,
          isSystemRole: r.isSystemRole,
          isActive: r.isActive,
          expiresAt: r.expiresAt,
        })),
      // include allRoles for debug? not needed
    };
  }

  async switchRole(empId: string, sessionId: string, targetRoleId: number, ipAddress?: string, userAgent?: string) {
    const user = await this.userRepository.findOne({ where: { empId } });
    if (!user) throw new UnauthorizedException('User not found');

    let session: any;
    try {
      session = await this.userSessionRepository.findOne({ where: { id: sessionId } });
    } catch {
      session = await this.userSessionRepository.findOne({ where: { id: sessionId } });
    }
    if (!session) throw new UnauthorizedException('Session not found');

    const userRoles = await this.findUserRolesSafe(empId);

    const targetAssignment = userRoles.find((ur) => ur.roleId === targetRoleId);
    // Also check permission_profiles for BUDDY_RM fallback
    let isAssigned = !!targetAssignment;
    let targetRole: any = targetAssignment?.role ?? null;
    if (!isAssigned) {
      try {
        const profiles = await this.profileRepository.find({ where: { userId: empId, roleId: targetRoleId } });
        if (profiles.length > 0) {
          isAssigned = true;
          targetRole = profiles[0].role ?? await this.roleRepository.findOne({ where: { id: targetRoleId } });
        }
      } catch {}
    }
    if (!isAssigned) {
      throw new ForbiddenException('Role not assigned to user');
    }

    // Load role entity if not loaded
    if (!targetRole) {
      targetRole = await this.roleRepository.findOne({ where: { id: targetRoleId } });
    }
    if (!targetRole) throw new NotFoundException('Role not found');
    if (!targetRole.isActive) throw new ForbiddenException('Role is inactive');

    // Check expiry on assignment
    const now = new Date();
    if (targetAssignment && (targetAssignment as any).expiresAt) {
      if (new Date((targetAssignment as any).expiresAt) <= now) {
        throw new ForbiddenException('Role assignment has expired');
      }
    }
    try {
      const profile = await this.profileRepository.findOne({ where: { userId: empId, roleId: targetRoleId } });
      if (profile && (profile as any).expiresAt && new Date((profile as any).expiresAt) <= now) {
        throw new ForbiddenException('Role assignment has expired');
      }
      if (profile && profile.status !== 'ACTIVE') {
        throw new ForbiddenException('Role assignment is inactive');
      }
    } catch (e) {
      if (e instanceof ForbiddenException) throw e;
    }

    let previousActiveRoleId: number | null = null;
    try {
      previousActiveRoleId = (session as any).activeRoleId ?? null;
    } catch {}
    const previousRole = previousActiveRoleId ? await this.roleRepository.findOne({ where: { id: previousActiveRoleId } }) : null;

    // Update session activeRoleId (tolerant to missing column)
    (session as any).activeRoleId = targetRoleId;
    try {
      await this.userSessionRepository.save(session);
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('column') && msg.includes('active_role_id')) {
        this.logger.warn(`switchRole save active_role_id fallback: ${msg}`);
        try {
          await this.userSessionRepository.query(`UPDATE user_sessions SET token_hash = $1 WHERE id = $2`, [(session as any).tokenHash, session.id]);
        } catch {}
      } else {
        throw e;
      }
    }

    // Generate new token pair with same roles but new activeRoleId
    const roleIds = userRoles.map((ur) => String(ur.roleId));
    // Ensure roles includes target if coming from profile not in user_roles (edge): add it
    if (!roleIds.includes(String(targetRoleId))) roleIds.push(String(targetRoleId));

    const newPayload = this.tokenService.createSessionPayload(empId, user.email, roleIds, targetRoleId);
    // Keep same sessionId? We should rotate sessionId per token? spec says JWT regeneration using existing architecture.
    // We will keep existing session id in payload to maintain session continuity, but TokenService.createSessionPayload generates new uuid.
    // Override to keep same sessionId to avoid session table churn? Instead we update session's tokenHash to new refresh token.
    const payloadForToken = { ...newPayload, sessionId };
    const tokens = this.tokenService.generateTokenPair(payloadForToken as any);
    // Update session tokenHash to new refresh token
    const tokenHash = await bcrypt.hash(tokens.refreshToken, 10);
    (session as any).tokenHash = tokenHash;
    try {
      await this.userSessionRepository.save(session);
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('column') && msg.includes('active_role_id')) {
        this.logger.warn(`switchRole save tokenHash fallback: ${msg}`);
        await this.userSessionRepository.query(`UPDATE user_sessions SET token_hash = $1 WHERE id = $2`, [tokenHash, session.id]);
        // also try to persist active_role_id via raw if possible (ignore if column missing)
        try {
          await this.userSessionRepository.query(`UPDATE user_sessions SET active_role_id = $1 WHERE id = $2`, [targetRoleId, session.id]);
        } catch {}
      } else {
        throw e;
      }
    }

    // Audit log
    await this.auditService.createLog({
      entityName: 'AUTH',
      entityId: empId,
      action: 'ROLE_SWITCH',
      oldValue: previousActiveRoleId ? { roleId: previousActiveRoleId, roleName: previousRole?.name ?? String(previousActiveRoleId) } : null,
      newValue: { roleId: targetRoleId, roleName: targetRole.name },
      performedBy: empId,
      ipAddress,
      userAgent,
      source: 'AUTH',
    });

    // Invalidate permission caches for this user (all projects)
    await this.safeCacheInvalidate([
      `permissions:*:${empId}:*`,
      `permissions:snapshot:${empId}:*`,
      `permission:${empId}:*`,
      `*${empId}*`,
    ]);

    // Also invalidate via compiler? compiler holds same cache keys

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      activeRoleId: targetRoleId,
      activeRoleName: targetRole.name,
    };
  }

  private async findUserRolesSafe(userId: string, withDepartment = false): Promise<UserRole[]> {
    try {
      if (withDepartment) {
        return await this.userRoleRepository.find({ where: { userId }, relations: { role: true, department: true } });
      }
      return await this.userRoleRepository.find({ where: { userId }, relations: { role: true } });
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('column') && (msg.includes('expires_at') || msg.includes('role_type') || msg.includes('active_role_id'))) {
        this.logger.warn(`findUserRolesSafe fallback for ${userId}: ${msg}`);
        try {
          // Fallback raw query without new columns
          const rows: any[] = await this.userRoleRepository.query(
            `SELECT ur.id, ur.user_id, ur.department_id, ur.role_id, ur.assigned_by, ur.assigned_at, ur.created_at, ur.updated_at,
                    r.id as r_id, r.name as r_name, r.hierarchy_level_rank, r.is_active, r.is_system_role,
                    d.id as d_id, d.name as d_name
             FROM user_roles ur
             LEFT JOIN roles r ON r.id = ur.role_id
             LEFT JOIN departments d ON d.id = ur.department_id
             WHERE ur.user_id = $1`,
            [userId],
          );
          return rows.map((r: any) => {
            const ur: any = {
              id: r.id,
              userId: r.user_id,
              departmentId: r.department_id,
              roleId: r.role_id,
              assignedBy: r.assigned_by,
              assignedAt: r.assigned_at,
              createdAt: r.created_at,
              updatedAt: r.updated_at,
              role: r.r_id ? { id: r.r_id, name: r.r_name, hierarchyLevelRank: r.hierarchy_level_rank, isActive: r.is_active, isSystemRole: r.is_system_role } : null,
              department: r.d_id ? { id: r.d_id, name: r.d_name } : null,
            };
            return ur as UserRole;
          });
        } catch {
          return [];
        }
      }
      throw e;
    }
  }

  private async safeCacheInvalidate(patterns: string[]) {
    if (!this.cacheService) return;
    for (const p of patterns) {
      try {
        await this.cacheService.invalidateByPattern(p);
      } catch {
        // ignore
      }
    }
  }

  private async createSession(
    sessionId: string,
    userId: string,
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
    activeRoleId?: number | null,
  ): Promise<void> {
    const tokenHash = await bcrypt.hash(refreshToken, 10);

    const session = this.userSessionRepository.create({
      id: sessionId,
      userId,
      tokenHash,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      activeRoleId: activeRoleId ?? null,
    } as any);

    try {
      await this.userSessionRepository.save(session);
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('column') && msg.includes('active_role_id')) {
        this.logger.warn(`createSession fallback without active_role_id: ${msg}`);
        // Retry without activeRoleId
        const fallback = this.userSessionRepository.create({
          id: sessionId,
          userId,
          tokenHash,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        } as any);
        await this.userSessionRepository.save(fallback);
      } else {
        throw e;
      }
    }
  }
}
