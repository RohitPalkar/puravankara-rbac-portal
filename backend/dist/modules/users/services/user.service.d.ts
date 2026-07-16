import { Repository, DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import { UserZone } from '../entities/user-zone.entity';
import { UserReportingLine } from '../entities/user-reporting-line.entity';
import { UserAuth } from '../../auth/entities/user-auth.entity';
import { PaginationQuery, PaginatedResult } from '../../../common/crud/crud.interface';
import { CreateUserDto, UpdateUserDto, CreateUserFullDto } from '../dto/user.dto';
import { PermissionCompilerService } from '../../permissions/services/permission-compiler.service';
import { NotificationService } from '../../notifications/services/notification.service';
export declare class UserService {
    readonly repository: Repository<User>;
    readonly userRoleRepository: Repository<UserRole>;
    readonly userZoneRepository: Repository<UserZone>;
    readonly reportingLineRepository: Repository<UserReportingLine>;
    readonly userAuthRepository: Repository<UserAuth>;
    private readonly dataSource;
    private readonly logger;
    constructor(repository: Repository<User>, userRoleRepository: Repository<UserRole>, userZoneRepository: Repository<UserZone>, reportingLineRepository: Repository<UserReportingLine>, userAuthRepository: Repository<UserAuth>, dataSource: DataSource);
    findAll(query: PaginationQuery): Promise<PaginatedResult<User>>;
    findById(id: string): Promise<User>;
    create(dto: CreateUserDto): Promise<{
        user: User;
        generatedPassword: string;
    }>;
    private generateRandomPassword;
    update(id: string, dto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<void>;
    createFull(dto: CreateUserFullDto): Promise<{
        user: User;
        roles: UserRole[];
        zones: UserZone[];
        reportingLines: UserReportingLine[];
    }>;
    private generateEmpId;
}
export declare class UserRoleService {
    readonly repository: Repository<UserRole>;
    private readonly notifService;
    private readonly compilerService;
    constructor(repository: Repository<UserRole>, notifService: NotificationService, compilerService: PermissionCompilerService);
    findByUser(userId: string): Promise<UserRole[]>;
    assign(dto: {
        userId: string;
        departmentId: number;
        roleId: number;
        assignedBy?: string;
    }): Promise<UserRole>;
    revoke(userId: string, departmentId: number, roleId: number): Promise<void>;
}
export declare class UserReportingLineService {
    readonly repository: Repository<UserReportingLine>;
    constructor(repository: Repository<UserReportingLine>);
    findByUser(userId: string): Promise<UserReportingLine[]>;
    create(dto: {
        userId: string;
        reportsToUserId: string;
        levelRank: number;
        effectiveFrom?: string;
        effectiveTo?: string;
    }): Promise<UserReportingLine>;
    remove(userId: string, reportsToUserId: string, levelRank: number): Promise<void>;
}
