import { RoleProjectPermissionService } from './services/role-project-permission.service';
declare class CreateRoleProjectPermissionDto {
    roleId: number;
    projectId: number;
    moduleId: number;
    subModuleId?: number;
    actionId: number;
}
export declare class RoleProjectPermissionController {
    private readonly svc;
    constructor(svc: RoleProjectPermissionService);
    findAll(): Promise<import("./entities/role-project-permission.entity").RoleProjectPermission[]>;
    findByRole(roleId: number): Promise<import("./entities/role-project-permission.entity").RoleProjectPermission[]>;
    findByRoleAndProject(roleId: number, projectId: number): Promise<import("./entities/role-project-permission.entity").RoleProjectPermission[]>;
    create(dto: CreateRoleProjectPermissionDto): Promise<import("./entities/role-project-permission.entity").RoleProjectPermission>;
    remove(id: number): Promise<void>;
}
export {};
