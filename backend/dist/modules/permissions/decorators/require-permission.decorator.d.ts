export declare const PERMISSION_KEY = "permission";
export interface RequirePermissionOptions {
    module: string;
    action: string;
}
export declare const RequirePermission: (options: RequirePermissionOptions) => import("@nestjs/common").CustomDecorator<string>;
