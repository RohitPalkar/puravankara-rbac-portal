"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleProjectPermission = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../common/entities/app-base.entity");
const role_entity_1 = require("../../organization/entities/role.entity");
const project_entity_1 = require("../../projects/entities/project.entity");
const module_entity_1 = require("../../product-catalog/entities/module.entity");
const sub_module_entity_1 = require("../../product-catalog/entities/sub-module.entity");
const action_entity_1 = require("../../product-catalog/entities/action.entity");
let RoleProjectPermission = class RoleProjectPermission extends app_base_entity_1.AppBaseEntity {
    roleId;
    projectId;
    moduleId;
    subModuleId;
    actionId;
    role;
    project;
    module;
    subModule;
    action;
};
exports.RoleProjectPermission = RoleProjectPermission;
__decorate([
    (0, typeorm_1.Column)({ name: 'role_id', nullable: false }),
    __metadata("design:type", Number)
], RoleProjectPermission.prototype, "roleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id', nullable: false }),
    __metadata("design:type", Number)
], RoleProjectPermission.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'module_id', nullable: false }),
    __metadata("design:type", Number)
], RoleProjectPermission.prototype, "moduleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sub_module_id', nullable: true }),
    __metadata("design:type", Number)
], RoleProjectPermission.prototype, "subModuleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'action_id', nullable: false }),
    __metadata("design:type", Number)
], RoleProjectPermission.prototype, "actionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => role_entity_1.Role, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'role_id' }),
    __metadata("design:type", role_entity_1.Role)
], RoleProjectPermission.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.Project)
], RoleProjectPermission.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => module_entity_1.Module, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'module_id' }),
    __metadata("design:type", module_entity_1.Module)
], RoleProjectPermission.prototype, "module", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sub_module_entity_1.SubModule, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'sub_module_id' }),
    __metadata("design:type", sub_module_entity_1.SubModule)
], RoleProjectPermission.prototype, "subModule", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => action_entity_1.Action, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'action_id' }),
    __metadata("design:type", action_entity_1.Action)
], RoleProjectPermission.prototype, "action", void 0);
exports.RoleProjectPermission = RoleProjectPermission = __decorate([
    (0, typeorm_1.Entity)('role_project_permissions'),
    (0, typeorm_1.Unique)(['roleId', 'projectId', 'moduleId', 'subModuleId', 'actionId']),
    (0, typeorm_1.Index)(['roleId', 'projectId'])
], RoleProjectPermission);
//# sourceMappingURL=role-project-permission.entity.js.map