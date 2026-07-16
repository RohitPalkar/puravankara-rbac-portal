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
exports.UserPermissionTemplate = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const project_entity_1 = require("../../projects/entities/project.entity");
const permission_template_entity_1 = require("./permission-template.entity");
let UserPermissionTemplate = class UserPermissionTemplate {
    userId;
    projectId;
    templateId;
    assignedBy;
    assignedAt;
    user;
    project;
    template;
    createdAt;
    updatedAt;
};
exports.UserPermissionTemplate = UserPermissionTemplate;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'user_id' }),
    __metadata("design:type", String)
], UserPermissionTemplate.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'project_id' }),
    __metadata("design:type", Number)
], UserPermissionTemplate.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'template_id' }),
    __metadata("design:type", Number)
], UserPermissionTemplate.prototype, "templateId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_by', nullable: true }),
    __metadata("design:type", String)
], UserPermissionTemplate.prototype, "assignedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], UserPermissionTemplate.prototype, "assignedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], UserPermissionTemplate.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.Project)
], UserPermissionTemplate.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => permission_template_entity_1.PermissionTemplate, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'template_id' }),
    __metadata("design:type", permission_template_entity_1.PermissionTemplate)
], UserPermissionTemplate.prototype, "template", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], UserPermissionTemplate.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], UserPermissionTemplate.prototype, "updatedAt", void 0);
exports.UserPermissionTemplate = UserPermissionTemplate = __decorate([
    (0, typeorm_1.Entity)('user_permission_templates')
], UserPermissionTemplate);
//# sourceMappingURL=user-permission-template.entity.js.map