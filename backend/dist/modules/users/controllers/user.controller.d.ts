import { UserService, UserRoleService, UserReportingLineService } from '../services/user.service';
import { CreateUserDto, UpdateUserDto, CreateUserRoleDto, CreateUserReportingLineDto, CreateUserFullDto } from '../dto/user.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    findAll(query: PaginationQueryDto): Promise<import("../../../common/crud/crud.interface").PaginatedResult<import("../entities/user.entity").User>>;
    findById(id: string): Promise<import("../entities/user.entity").User>;
    create(dto: CreateUserDto): Promise<{
        user: import("../entities/user.entity").User;
        generatedPassword: string;
    }>;
    createFull(dto: CreateUserFullDto): Promise<{
        user: import("../entities/user.entity").User;
        roles: import("../entities/user-role.entity").UserRole[];
        zones: import("../entities/user-zone.entity").UserZone[];
        reportingLines: import("../entities/user-reporting-line.entity").UserReportingLine[];
    }>;
    update(id: string, dto: UpdateUserDto): Promise<import("../entities/user.entity").User>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
export declare class UserRoleController {
    private readonly userRoleService;
    constructor(userRoleService: UserRoleService);
    findByUser(userId: string): Promise<import("../entities/user-role.entity").UserRole[]>;
    assign(dto: CreateUserRoleDto): Promise<import("../entities/user-role.entity").UserRole>;
    revoke(userId: string, departmentId: number, roleId: number): Promise<{
        message: string;
    }>;
}
export declare class UserReportingLineController {
    private readonly rlService;
    constructor(rlService: UserReportingLineService);
    findByUser(userId: string): Promise<import("../entities/user-reporting-line.entity").UserReportingLine[]>;
    create(dto: CreateUserReportingLineDto): Promise<import("../entities/user-reporting-line.entity").UserReportingLine>;
    remove(userId: string, reportsToUserId: string, levelRank: number): Promise<{
        message: string;
    }>;
}
