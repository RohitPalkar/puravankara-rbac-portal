import { Repository } from 'typeorm';
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
export declare class AuthService {
    private readonly userRepository;
    private readonly userAuthRepository;
    private readonly userSessionRepository;
    private readonly userRoleRepository;
    private readonly accessRepo;
    private readonly tokenService;
    private readonly passwordService;
    private readonly auditService;
    private readonly compilerService;
    private readonly logger;
    constructor(userRepository: Repository<User>, userAuthRepository: Repository<UserAuth>, userSessionRepository: Repository<UserSession>, userRoleRepository: Repository<UserRole>, accessRepo: Repository<UserProjectAccess>, tokenService: TokenService, passwordService: PasswordService, auditService: AuditService, compilerService: PermissionCompilerService);
    login(dto: LoginDto, ipAddress?: string, userAgent?: string): Promise<AuthResponseDto>;
    refresh(refreshToken: string, ipAddress?: string, userAgent?: string): Promise<AuthResponseDto>;
    logout(sessionId: string): Promise<void>;
    logoutAll(empId: string): Promise<void>;
    setInitialPassword(userId: string, password: string): Promise<void>;
    getProfile(empId: string): Promise<{
        user: {
            empId: string;
            name: string;
            email: string;
            departmentId: number;
            department: string;
            employmentStatus: string;
        };
        roles: {
            roleId: number;
            roleName: string;
            departmentId: number;
            departmentName: string;
        }[];
    }>;
    private createSession;
}
