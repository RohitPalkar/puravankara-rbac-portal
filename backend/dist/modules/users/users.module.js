"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./entities/user.entity");
const user_role_entity_1 = require("./entities/user-role.entity");
const user_zone_entity_1 = require("./entities/user-zone.entity");
const user_reporting_line_entity_1 = require("./entities/user-reporting-line.entity");
const user_auth_entity_1 = require("../auth/entities/user-auth.entity");
const user_service_1 = require("./services/user.service");
const user_zone_service_1 = require("./services/user-zone.service");
const user_controller_1 = require("./controllers/user.controller");
const user_zone_controller_1 = require("./controllers/user-zone.controller");
const permissions_module_1 = require("../permissions/permissions.module");
const notifications_module_1 = require("../notifications/notifications.module");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, user_role_entity_1.UserRole, user_zone_entity_1.UserZone, user_reporting_line_entity_1.UserReportingLine, user_auth_entity_1.UserAuth]),
            permissions_module_1.PermissionsModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [
            user_controller_1.UserController,
            user_controller_1.UserRoleController,
            user_controller_1.UserReportingLineController,
            user_zone_controller_1.UserZoneController,
        ],
        providers: [
            user_service_1.UserService,
            user_service_1.UserRoleService,
            user_zone_service_1.UserZoneService,
            user_service_1.UserReportingLineService,
        ],
        exports: [typeorm_1.TypeOrmModule],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map