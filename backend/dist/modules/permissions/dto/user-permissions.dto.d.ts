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
declare class UserInfo {
    empId: string;
    name: string;
    email: string;
    roles: string[];
}
export declare class UserPermissionsResponse {
    user: UserInfo;
    projects: ProjectPermissions[];
}
export { ProjectPermissions, ModulePermissions, SubModulePermissions, ActionPermission, UserInfo };
