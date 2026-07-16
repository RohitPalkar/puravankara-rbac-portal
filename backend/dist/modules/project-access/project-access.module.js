"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectAccessModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_project_access_entity_1 = require("./entities/user-project-access.entity");
const project_group_entity_1 = require("./entities/project-group.entity");
const project_group_project_entity_1 = require("./entities/project-group-project.entity");
const user_project_group_entity_1 = require("./entities/user-project-group.entity");
const project_access_service_1 = require("./services/project-access.service");
const project_access_controller_1 = require("./controllers/project-access.controller");
const permissions_module_1 = require("../permissions/permissions.module");
const notifications_module_1 = require("../notifications/notifications.module");
let ProjectAccessModule = class ProjectAccessModule {
};
exports.ProjectAccessModule = ProjectAccessModule;
exports.ProjectAccessModule = ProjectAccessModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_project_access_entity_1.UserProjectAccess,
                project_group_entity_1.ProjectGroup,
                project_group_project_entity_1.ProjectGroupProject,
                user_project_group_entity_1.UserProjectGroup,
            ]),
            permissions_module_1.PermissionsModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [
            project_access_controller_1.UserProjectAccessController,
            project_access_controller_1.ProjectGroupController,
            project_access_controller_1.ProjectGroupProjectController,
            project_access_controller_1.UserProjectGroupController,
        ],
        providers: [
            project_access_service_1.UserProjectAccessService,
            project_access_service_1.ProjectGroupService,
            project_access_service_1.ProjectGroupProjectService,
            project_access_service_1.UserProjectGroupService,
        ],
        exports: [typeorm_1.TypeOrmModule],
    })
], ProjectAccessModule);
//# sourceMappingURL=project-access.module.js.map