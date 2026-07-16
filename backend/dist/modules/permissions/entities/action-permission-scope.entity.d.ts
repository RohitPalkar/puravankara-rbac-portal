import { Action } from '../../product-catalog/entities/action.entity';
import { PermissionScope } from './permission-scope.entity';
export declare class ActionPermissionScope {
    actionId: number;
    scopeId: number;
    action: Action;
    scope: PermissionScope;
    createdAt: Date;
    updatedAt: Date;
}
