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
exports.TemplatePermission = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../common/entities/app-base.entity");
const permission_template_entity_1 = require("./permission-template.entity");
const module_entity_1 = require("../../product-catalog/entities/module.entity");
const sub_module_entity_1 = require("../../product-catalog/entities/sub-module.entity");
const action_entity_1 = require("../../product-catalog/entities/action.entity");
let TemplatePermission = class TemplatePermission extends app_base_entity_1.AppBaseEntity {
    templateId;
    moduleId;
    subModuleId;
    actionId;
    template;
    module;
    subModule;
    action;
};
exports.TemplatePermission = TemplatePermission;
__decorate([
    (0, typeorm_1.Column)({ name: 'template_id', nullable: false }),
    __metadata("design:type", Number)
], TemplatePermission.prototype, "templateId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'module_id', nullable: false }),
    __metadata("design:type", Number)
], TemplatePermission.prototype, "moduleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sub_module_id', nullable: true }),
    __metadata("design:type", Number)
], TemplatePermission.prototype, "subModuleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'action_id', nullable: false }),
    __metadata("design:type", Number)
], TemplatePermission.prototype, "actionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => permission_template_entity_1.PermissionTemplate, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'template_id' }),
    __metadata("design:type", permission_template_entity_1.PermissionTemplate)
], TemplatePermission.prototype, "template", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => module_entity_1.Module, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'module_id' }),
    __metadata("design:type", module_entity_1.Module)
], TemplatePermission.prototype, "module", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sub_module_entity_1.SubModule, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'sub_module_id' }),
    __metadata("design:type", sub_module_entity_1.SubModule)
], TemplatePermission.prototype, "subModule", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => action_entity_1.Action, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'action_id' }),
    __metadata("design:type", action_entity_1.Action)
], TemplatePermission.prototype, "action", void 0);
exports.TemplatePermission = TemplatePermission = __decorate([
    (0, typeorm_1.Entity)('template_permissions'),
    (0, typeorm_1.Unique)(['templateId', 'moduleId', 'subModuleId', 'actionId'])
], TemplatePermission);
//# sourceMappingURL=template-permission.entity.js.map