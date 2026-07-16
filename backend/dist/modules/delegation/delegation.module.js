"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelegationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_delegation_entity_1 = require("./entities/user-delegation.entity");
const user_entity_1 = require("../users/entities/user.entity");
const delegation_service_1 = require("./services/delegation.service");
const delegation_controller_1 = require("./controllers/delegation.controller");
const audit_module_1 = require("../audit/audit.module");
const notifications_module_1 = require("../notifications/notifications.module");
let DelegationModule = class DelegationModule {
};
exports.DelegationModule = DelegationModule;
exports.DelegationModule = DelegationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_delegation_entity_1.UserDelegation, user_entity_1.User]),
            audit_module_1.AuditModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [delegation_controller_1.DelegationController],
        providers: [delegation_service_1.DelegationService],
        exports: [delegation_service_1.DelegationService, typeorm_1.TypeOrmModule],
    })
], DelegationModule);
//# sourceMappingURL=delegation.module.js.map