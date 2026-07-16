export declare class CreateUserDto {
    name: string;
    email: string;
    departmentId: number;
    employmentStatus?: string;
    isActive?: boolean;
}
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    departmentId?: number;
    employmentStatus?: string;
    isActive?: boolean;
}
export declare class CreateUserRoleDto {
    userId: string;
    departmentId: number;
    roleId: number;
}
export declare class CreateUserReportingLineDto {
    userId: string;
    reportsToUserId: string;
    levelRank: number;
    effectiveFrom?: string;
    effectiveTo?: string;
}
export declare class ReportingEntryDto {
    levelRank: number;
    managerId: string;
}
export declare class UserOrganizationDto {
    zones: number[];
    primaryRole: number;
    secondaryRoles?: number[];
    reporting?: ReportingEntryDto[];
}
export declare class CreateUserFullDto {
    basic: CreateUserDto;
    organization: UserOrganizationDto;
}
