"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const department_entity_1 = require("./entities/department.entity");
const role_entity_1 = require("./entities/role.entity");
const department_role_entity_1 = require("./entities/department-role.entity");
const organization_service_1 = require("./services/organization.service");
const department_role_service_1 = require("./services/department-role.service");
const organization_controller_1 = require("./controllers/organization.controller");
const department_role_controller_1 = require("./controllers/department-role.controller");
let OrganizationModule = class OrganizationModule {
};
exports.OrganizationModule = OrganizationModule;
exports.OrganizationModule = OrganizationModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([department_entity_1.Department, role_entity_1.Role, department_role_entity_1.DepartmentRole])],
        controllers: [organization_controller_1.DepartmentController, organization_controller_1.RoleController, department_role_controller_1.DepartmentRoleController],
        providers: [organization_service_1.DepartmentService, organization_service_1.RoleService, department_role_service_1.DepartmentRoleService],
        exports: [typeorm_1.TypeOrmModule],
    })
], OrganizationModule);
//# sourceMappingURL=organization.module.js.map