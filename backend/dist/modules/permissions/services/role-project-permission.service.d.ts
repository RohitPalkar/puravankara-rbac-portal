import { Repository } from 'typeorm';
import { RoleProjectPermission } from '../entities/role-project-permission.entity';
import { PermissionCompilerService } from './permission-compiler.service';
export declare class RoleProjectPermissionService {
    private readonly repository;
    private readonly compilerService;
    constructor(repository: Repository<RoleProjectPermission>, compilerService: PermissionCompilerService);
    findAll(): Promise<RoleProjectPermission[]>;
    findByRole(roleId: number): Promise<RoleProjectPermission[]>;
    findByRoleAndProject(roleId: number, projectId: number): Promise<RoleProjectPermission[]>;
    create(dto: {
        roleId: number;
        projectId: number;
        moduleId: number;
        subModuleId?: number;
        actionId: number;
    }): Promise<RoleProjectPermission>;
    remove(id: number): Promise<void>;
}
