import { Repository } from 'typeorm';
import { PermissionTemplate } from '../entities/permission-template.entity';
import { TemplatePermission } from '../entities/template-permission.entity';
export declare class PermissionTemplateService {
    readonly repo: Repository<PermissionTemplate>;
    readonly tpRepo: Repository<TemplatePermission>;
    constructor(repo: Repository<PermissionTemplate>, tpRepo: Repository<TemplatePermission>);
    findAll(): Promise<PermissionTemplate[]>;
    findById(id: number): Promise<PermissionTemplate>;
    create(dto: {
        name: string;
        description?: string;
    }): Promise<PermissionTemplate>;
    update(id: number, dto: {
        name?: string;
        description?: string;
        isActive?: boolean;
    }): Promise<PermissionTemplate>;
    remove(id: number): Promise<void>;
    getPermissions(templateId: number): Promise<TemplatePermission[]>;
    setPermissions(templateId: number, permissions: {
        moduleId: number;
        subModuleId?: number;
        actionId: number;
    }[]): Promise<TemplatePermission[]>;
}
