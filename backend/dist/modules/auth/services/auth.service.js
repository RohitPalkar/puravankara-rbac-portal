"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("../../users/entities/user.entity");
const user_auth_entity_1 = require("../entities/user-auth.entity");
const user_session_entity_1 = require("../entities/user-session.entity");
const user_role_entity_1 = require("../../users/entities/user-role.entity");
const user_project_access_entity_1 = require("../../project-access/entities/user-project-access.entity");
const token_service_1 = require("./token.service");
const password_service_1 = require("./password.service");
const audit_service_1 = require("../../audit/services/audit.service");
const permission_compiler_service_1 = require("../../permissions/services/permission-compiler.service");
const MAX_FAILED_ATTEMPTS = 5;
let AuthService = AuthService_1 = class AuthService {
    userRepository;
    userAuthRepository;
    userSessionRepository;
    userRoleRepository;
    accessRepo;
    tokenService;
    passwordService;
    auditService;
    compilerService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(userRepository, userAuthRepository, userSessionRepository, userRoleRepository, accessRepo, tokenService, passwordService, auditService, compilerService) {
        this.userRepository = userRepository;
        this.userAuthRepository = userAuthRepository;
        this.userSessionRepository = userSessionRepository;
        this.userRoleRepository = userRoleRepository;
        this.accessRepo = accessRepo;
        this.tokenService = tokenService;
        this.passwordService = passwordService;
        this.auditService = auditService;
        this.compilerService = compilerService;
    }
    async login(dto, ipAddress, userAgent) {
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
            throw new common_1.UnauthorizedException('Invalid email or password');
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
            throw new common_1.UnauthorizedException('Account has been deactivated');
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
            throw new common_1.ForbiddenException('Account is inactive. Contact administrator.');
        }
        const userAuth = await this.userAuthRepository.findOne({
            where: { userId: user.empId },
        });
        if (!userAuth) {
            throw new common_1.UnauthorizedException('Account not configured. Contact administrator to set up your password.');
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
            throw new common_1.ForbiddenException('Account is locked due to too many failed attempts. Contact administrator.');
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
            throw new common_1.UnauthorizedException(`Please sign in with ${userAuth.authProvider} instead.`);
        }
        const isPasswordValid = await this.passwordService.comparePassword(dto.password, userAuth.passwordHash || '');
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
            throw new common_1.UnauthorizedException('Invalid email or password');
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
        const payload = this.tokenService.createSessionPayload(user.empId, user.email, roleIds);
        const tokens = this.tokenService.generateTokenPair(payload);
        await this.createSession(payload.sessionId, user.empId, tokens.refreshToken, ipAddress, userAgent);
        let permissions = undefined;
        try {
            await this.compilerService.compileForAllUserProjects(user.empId);
            const accessRows = await this.accessRepo.find({
                where: { userId: user.empId },
                relations: { project: true },
                take: 1,
            });
            if (accessRows.length > 0) {
                const snapshot = await this.compilerService.getCompiled(user.empId, accessRows[0].projectId);
                permissions = {
                    projects: [{
                            id: accessRows[0].projectId,
                            name: accessRows[0].project.name,
                            modules: snapshot.modules,
                        }],
                };
            }
        }
        catch {
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
    async refresh(refreshToken, ipAddress, userAgent) {
        const payload = this.tokenService.verifyRefreshToken(refreshToken);
        const session = await this.userSessionRepository.findOne({
            where: { id: payload.sessionId },
        });
        if (!session) {
            throw new common_1.UnauthorizedException('Session not found');
        }
        const isTokenValid = await bcrypt.compare(refreshToken, session.tokenHash);
        if (!isTokenValid) {
            await this.userSessionRepository.delete({ id: session.id });
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const user = await this.userRepository.findOne({
            where: { empId: payload.sub, isActive: true },
        });
        if (!user) {
            await this.userSessionRepository.delete({ id: session.id });
            throw new common_1.UnauthorizedException('User not found or inactive');
        }
        await this.userSessionRepository.delete({ id: session.id });
        const userRoles = await this.userRoleRepository.find({
            where: { userId: user.empId },
            relations: { role: true },
        });
        const roleIds = userRoles.map((ur) => String(ur.roleId));
        const newPayload = this.tokenService.createSessionPayload(user.empId, user.email, roleIds);
        const tokens = this.tokenService.generateTokenPair(newPayload);
        await this.createSession(newPayload.sessionId, user.empId, tokens.refreshToken, ipAddress, userAgent);
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
    async logout(sessionId) {
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
    async logoutAll(empId) {
        await this.userSessionRepository.delete({ userId: empId });
        await this.auditService.createLog({
            entityName: 'AUTH',
            action: 'LOGOUT_ALL',
            entityId: empId,
            performedBy: empId,
            source: 'AUTH',
        });
    }
    async setInitialPassword(userId, password) {
        const user = await this.userRepository.findOne({
            where: { empId: userId },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const passwordHash = await bcrypt.hash(password, 10);
        let userAuth = await this.userAuthRepository.findOne({
            where: { userId },
        });
        if (userAuth) {
            userAuth.passwordHash = passwordHash;
            userAuth.failedAttempts = 0;
            userAuth.isLocked = false;
            await this.userAuthRepository.save(userAuth);
        }
        else {
            await this.userAuthRepository.save(this.userAuthRepository.create({
                userId,
                passwordHash,
                authProvider: 'LOCAL',
            }));
        }
    }
    async getProfile(empId) {
        const user = await this.userRepository.findOne({
            where: { empId },
            relations: { department: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
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
    async createSession(sessionId, userId, refreshToken, ipAddress, userAgent) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(user_auth_entity_1.UserAuth)),
    __param(2, (0, typeorm_1.InjectRepository)(user_session_entity_1.UserSession)),
    __param(3, (0, typeorm_1.InjectRepository)(user_role_entity_1.UserRole)),
    __param(4, (0, typeorm_1.InjectRepository)(user_project_access_entity_1.UserProjectAccess)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        token_service_1.TokenService,
        password_service_1.PasswordService,
        audit_service_1.AuditService,
        permission_compiler_service_1.PermissionCompilerService])
], AuthService);
//# sourceMappingURL=auth.service.js.map