import { PermissionService } from './services/permission.service';
import { PermissionCompilerService } from './services/permission-compiler.service';
import { UserPermissionsResponse } from './dto/user-permissions.dto';
import { ExplainPermissionDto, ExplainPermissionResponse } from './dto/explain-permission.dto';
export declare class PermissionController {
    private readonly permissionService;
    private readonly compilerService;
    constructor(permissionService: PermissionService, compilerService: PermissionCompilerService);
    getMyPermissions(req: any): Promise<UserPermissionsResponse>;
    compile(userId: string, projectId: number): Promise<{
        message: string;
    }>;
    compileAll(userId: string): Promise<{
        message: string;
    }>;
    getSnapshot(userId: string, projectId: number): Promise<{
        modules: any[];
    }>;
    getUserPermissions(userId: string): Promise<UserPermissionsResponse>;
    explain(dto: ExplainPermissionDto): Promise<ExplainPermissionResponse>;
}
