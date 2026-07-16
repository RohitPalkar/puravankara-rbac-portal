import { PermissionTemplateService } from './services/permission-template.service';
declare class ActionPermissionDto {
    moduleId: number;
    subModuleId?: number;
    actionId: number;
}
declare class SetPermissionsDto {
    permissions: ActionPermissionDto[];
}
export declare class PermissionTemplateController {
    private readonly svc;
    constructor(svc: PermissionTemplateService);
    findAll(): Promise<import("./entities/permission-template.entity").PermissionTemplate[]>;
    findById(id: number): Promise<import("./entities/permission-template.entity").PermissionTemplate>;
    create(dto: {
        name: string;
        description?: string;
    }): Promise<import("./entities/permission-template.entity").PermissionTemplate>;
    update(id: number, dto: {
        name?: string;
        description?: string;
        isActive?: boolean;
    }): Promise<import("./entities/permission-template.entity").PermissionTemplate>;
    remove(id: number): Promise<void>;
    getPermissions(id: number): Promise<import("./entities/template-permission.entity").TemplatePermission[]>;
    setPermissions(id: number, dto: SetPermissionsDto): Promise<import("./entities/template-permission.entity").TemplatePermission[]>;
}
export {};
