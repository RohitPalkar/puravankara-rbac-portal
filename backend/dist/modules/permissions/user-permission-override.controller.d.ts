import { UserPermissionOverrideService } from './services/user-permission-override.service';
import { PermissionType } from '../../common/enums';
declare class CreateOverrideDto {
    userId: string;
    projectId: number;
    moduleId: number;
    subModuleId?: number;
    actionId: number;
    permissionType: PermissionType;
    reason?: string;
}
export declare class UserPermissionOverrideController {
    private readonly svc;
    constructor(svc: UserPermissionOverrideService);
    findByUser(userId: string): Promise<import("./entities/user-permission-override.entity").UserPermissionOverride[]>;
    findByUserAndProject(userId: string, projectId: number): Promise<import("./entities/user-permission-override.entity").UserPermissionOverride[]>;
    upsert(dto: CreateOverrideDto): Promise<import("./entities/user-permission-override.entity").UserPermissionOverride>;
    remove(id: number): Promise<void>;
}
export {};
