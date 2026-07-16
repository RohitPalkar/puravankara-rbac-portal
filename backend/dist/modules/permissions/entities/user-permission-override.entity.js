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
exports.UserPermissionOverride = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../common/entities/app-base.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const project_entity_1 = require("../../projects/entities/project.entity");
const module_entity_1 = require("../../product-catalog/entities/module.entity");
const sub_module_entity_1 = require("../../product-catalog/entities/sub-module.entity");
const action_entity_1 = require("../../product-catalog/entities/action.entity");
const enums_1 = require("../../../common/enums");
let UserPermissionOverride = class UserPermissionOverride extends app_base_entity_1.AppBaseEntity {
    userId;
    projectId;
    moduleId;
    subModuleId;
    actionId;
    permissionType;
    reason;
    user;
    project;
    module;
    subModule;
    action;
};
exports.UserPermissionOverride = UserPermissionOverride;
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', nullable: false }),
    __metadata("design:type", String)
], UserPermissionOverride.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id', nullable: false }),
    __metadata("design:type", Number)
], UserPermissionOverride.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'module_id', nullable: false }),
    __metadata("design:type", Number)
], UserPermissionOverride.prototype, "moduleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sub_module_id', nullable: true }),
    __metadata("design:type", Number)
], UserPermissionOverride.prototype, "subModuleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'action_id', nullable: false }),
    __metadata("design:type", Number)
], UserPermissionOverride.prototype, "actionId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'permission_type',
        type: 'varchar',
        length: 10,
        nullable: false,
    }),
    __metadata("design:type", String)
], UserPermissionOverride.prototype, "permissionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserPermissionOverride.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], UserPermissionOverride.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.Project)
], UserPermissionOverride.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => module_entity_1.Module, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'module_id' }),
    __metadata("design:type", module_entity_1.Module)
], UserPermissionOverride.prototype, "module", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sub_module_entity_1.SubModule, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'sub_module_id' }),
    __metadata("design:type", sub_module_entity_1.SubModule)
], UserPermissionOverride.prototype, "subModule", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => action_entity_1.Action, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'action_id' }),
    __metadata("design:type", action_entity_1.Action)
], UserPermissionOverride.prototype, "action", void 0);
exports.UserPermissionOverride = UserPermissionOverride = __decorate([
    (0, typeorm_1.Entity)('user_permission_overrides'),
    (0, typeorm_1.Unique)(['userId', 'projectId', 'moduleId', 'subModuleId', 'actionId'])
], UserPermissionOverride);
//# sourceMappingURL=user-permission-override.entity.js.map