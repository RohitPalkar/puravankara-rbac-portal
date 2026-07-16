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
exports.PermissionSnapshotHistory = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const project_entity_1 = require("../../projects/entities/project.entity");
let PermissionSnapshotHistory = class PermissionSnapshotHistory {
    id;
    userId;
    projectId;
    snapshot;
    changedBy;
    createdAt;
    user;
    project;
};
exports.PermissionSnapshotHistory = PermissionSnapshotHistory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PermissionSnapshotHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', nullable: false }),
    __metadata("design:type", String)
], PermissionSnapshotHistory.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id', nullable: false }),
    __metadata("design:type", Number)
], PermissionSnapshotHistory.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'snapshot', type: 'jsonb', nullable: false }),
    __metadata("design:type", Object)
], PermissionSnapshotHistory.prototype, "snapshot", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'changed_by', nullable: false }),
    __metadata("design:type", String)
], PermissionSnapshotHistory.prototype, "changedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], PermissionSnapshotHistory.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], PermissionSnapshotHistory.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.Project)
], PermissionSnapshotHistory.prototype, "project", void 0);
exports.PermissionSnapshotHistory = PermissionSnapshotHistory = __decorate([
    (0, typeorm_1.Entity)('permission_snapshot_history')
], PermissionSnapshotHistory);
//# sourceMappingURL=permission-snapshot-history.entity.js.map