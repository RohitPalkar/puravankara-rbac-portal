import { Repository } from 'typeorm';
import { UserPermissionOverride } from '../entities/user-permission-override.entity';
import { PermissionCompilerService } from './permission-compiler.service';
export declare class UserPermissionOverrideService {
    readonly repository: Repository<UserPermissionOverride>;
    private readonly compilerService;
    constructor(repository: Repository<UserPermissionOverride>, compilerService: PermissionCompilerService);
    findByUser(userId: string): Promise<UserPermissionOverride[]>;
    findByUserAndProject(userId: string, projectId: number): Promise<UserPermissionOverride[]>;
    upsert(dto: {
        userId: string;
        projectId: number;
        moduleId: number;
        subModuleId?: number;
        actionId: number;
        permissionType: 'ALLOW' | 'DENY';
        reason?: string;
    }): Promise<UserPermissionOverride>;
    remove(id: number): Promise<void>;
    removeByKey(userId: string, projectId: number, moduleId: number, actionId: number): Promise<void>;
}
