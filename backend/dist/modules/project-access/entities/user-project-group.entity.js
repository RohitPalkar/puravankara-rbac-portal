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
exports.UserProjectGroup = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const project_group_entity_1 = require("./project-group.entity");
let UserProjectGroup = class UserProjectGroup {
    userId;
    groupId;
    assignedBy;
    assignedAt;
    user;
    group;
    createdAt;
    updatedAt;
};
exports.UserProjectGroup = UserProjectGroup;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'user_id' }),
    __metadata("design:type", String)
], UserProjectGroup.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'group_id' }),
    __metadata("design:type", Number)
], UserProjectGroup.prototype, "groupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_by', nullable: true }),
    __metadata("design:type", String)
], UserProjectGroup.prototype, "assignedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], UserProjectGroup.prototype, "assignedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], UserProjectGroup.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_group_entity_1.ProjectGroup, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'group_id' }),
    __metadata("design:type", project_group_entity_1.ProjectGroup)
], UserProjectGroup.prototype, "group", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], UserProjectGroup.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], UserProjectGroup.prototype, "updatedAt", void 0);
exports.UserProjectGroup = UserProjectGroup = __decorate([
    (0, typeorm_1.Entity)('user_project_groups')
], UserProjectGroup);
//# sourceMappingURL=user-project-group.entity.js.map