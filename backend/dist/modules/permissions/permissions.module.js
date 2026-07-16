"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const role_project_permission_entity_1 = require("./entities/role-project-permission.entity");
const permission_template_entity_1 = require("./entities/permission-template.entity");
const template_permission_entity_1 = require("./entities/template-permission.entity");
const user_permission_template_entity_1 = require("./entities/user-permission-template.entity");
const user_permission_override_entity_1 = require("./entities/user-permission-override.entity");
const permission_scope_entity_1 = require("./entities/permission-scope.entity");
const action_permission_scope_entity_1 = require("./entities/action-permission-scope.entity");
const user_project_feature_matrix_entity_1 = require("./entities/user-project-feature-matrix.entity");
const permission_snapshot_history_entity_1 = require("./entities/permission-snapshot-history.entity");
const user_entity_1 = require("../users/entities/user.entity");
const user_role_entity_1 = require("../users/entities/user-role.entity");
const role_entity_1 = require("../organization/entities/role.entity");
const user_project_access_entity_1 = require("../project-access/entities/user-project-access.entity");
const user_project_group_entity_1 = require("../project-access/entities/user-project-group.entity");
const project_group_project_entity_1 = require("../project-access/entities/project-group-project.entity");
const module_entity_1 = require("../product-catalog/entities/module.entity");
const sub_module_entity_1 = require("../product-catalog/entities/sub-module.entity");
const action_entity_1 = require("../product-catalog/entities/action.entity");
const permission_service_1 = require("./services/permission.service");
const user_permission_override_service_1 = require("./services/user-permission-override.service");
const permission_template_service_1 = require("./services/permission-template.service");
const permission_cache_service_1 = require("./services/permission-cache.service");
const permission_compiler_service_1 = require("./services/permission-compiler.service");
const permission_guard_1 = require("./guards/permission.guard");
const permission_controller_1 = require("./permission.controller");
const user_permission_override_controller_1 = require("./user-permission-override.controller");
const permission_template_controller_1 = require("./permission-template.controller");
const role_project_permission_controller_1 = require("./role-project-permission.controller");
const role_project_permission_service_1 = require("./services/role-project-permission.service");
let PermissionsModule = class PermissionsModule {
};
exports.PermissionsModule = PermissionsModule;
exports.PermissionsModule = PermissionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                role_project_permission_entity_1.RoleProjectPermission,
                permission_template_entity_1.PermissionTemplate,
                template_permission_entity_1.TemplatePermission,
                user_permission_template_entity_1.UserPermissionTemplate,
                user_permission_override_entity_1.UserPermissionOverride,
                permission_scope_entity_1.PermissionScope,
                action_permission_scope_entity_1.ActionPermissionScope,
                user_project_feature_matrix_entity_1.UserProjectFeatureMatrix,
                permission_snapshot_history_entity_1.PermissionSnapshotHistory,
                user_entity_1.User,
                user_role_entity_1.UserRole,
                role_entity_1.Role,
                user_project_access_entity_1.UserProjectAccess,
                user_project_group_entity_1.UserProjectGroup,
                project_group_project_entity_1.ProjectGroupProject,
                module_entity_1.Module,
                sub_module_entity_1.SubModule,
                action_entity_1.Action,
            ]),
        ],
        controllers: [
            permission_controller_1.PermissionController,
            user_permission_override_controller_1.UserPermissionOverrideController,
            permission_template_controller_1.PermissionTemplateController,
            role_project_permission_controller_1.RoleProjectPermissionController,
        ],
        providers: [
            permission_service_1.PermissionService,
            user_permission_override_service_1.UserPermissionOverrideService,
            permission_template_service_1.PermissionTemplateService,
            role_project_permission_service_1.RoleProjectPermissionService,
            permission_cache_service_1.PermissionCacheService,
            permission_compiler_service_1.PermissionCompilerService,
            permission_guard_1.PermissionGuard,
        ],
        exports: [
            permission_service_1.PermissionService,
            permission_cache_service_1.PermissionCacheService,
            permission_compiler_service_1.PermissionCompilerService,
            permission_guard_1.PermissionGuard,
            typeorm_1.TypeOrmModule,
        ],
    })
], PermissionsModule);
//# sourceMappingURL=permissions.module.js.map