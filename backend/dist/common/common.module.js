"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../modules/users/entities/user.entity");
const user_role_entity_1 = require("../modules/users/entities/user-role.entity");
const role_project_permission_entity_1 = require("../modules/permissions/entities/role-project-permission.entity");
const template_permission_entity_1 = require("../modules/permissions/entities/template-permission.entity");
const module_action_entity_1 = require("../modules/product-catalog/entities/module-action.entity");
const department_role_entity_1 = require("../modules/organization/entities/department-role.entity");
const dependency_validator_service_1 = require("./services/dependency-validator.service");
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                user_role_entity_1.UserRole,
                role_project_permission_entity_1.RoleProjectPermission,
                template_permission_entity_1.TemplatePermission,
                module_action_entity_1.ModuleAction,
                department_role_entity_1.DepartmentRole,
            ]),
        ],
        providers: [dependency_validator_service_1.DependencyValidatorService],
        exports: [dependency_validator_service_1.DependencyValidatorService],
    })
], CommonModule);
//# sourceMappingURL=common.module.js.map