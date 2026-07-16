declare class UserInfo {
    empId: string;
    name: string;
    email: string;
    role: string;
    roles: string[];
}
declare class ActionPermission {
    code: string;
    label: string;
    allowed: boolean;
}
declare class SubModulePermissions {
    id: number;
    name: string;
    actions: ActionPermission[];
}
declare class ModulePermissions {
    id: number;
    name: string;
    subModules: SubModulePermissions[];
}
declare class ProjectPermissions {
    id: number;
    name: string;
    modules: ModulePermissions[];
}
declare class CompiledPermissions {
    projects: ProjectPermissions[];
}
export declare class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: UserInfo;
    permissions?: CompiledPermissions;
}
export {};
