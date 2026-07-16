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
exports.UserProjectFeatureMatrix = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const project_entity_1 = require("../../projects/entities/project.entity");
let UserProjectFeatureMatrix = class UserProjectFeatureMatrix {
    id;
    userId;
    projectId;
    featurePrivilegesDocument;
    generatedAt;
    version;
    user;
    project;
};
exports.UserProjectFeatureMatrix = UserProjectFeatureMatrix;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserProjectFeatureMatrix.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', nullable: false }),
    __metadata("design:type", String)
], UserProjectFeatureMatrix.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id', nullable: false }),
    __metadata("design:type", Number)
], UserProjectFeatureMatrix.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'feature_privileges_document', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], UserProjectFeatureMatrix.prototype, "featurePrivilegesDocument", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'generated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], UserProjectFeatureMatrix.prototype, "generatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'version', default: 1 }),
    __metadata("design:type", Number)
], UserProjectFeatureMatrix.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], UserProjectFeatureMatrix.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.Project)
], UserProjectFeatureMatrix.prototype, "project", void 0);
exports.UserProjectFeatureMatrix = UserProjectFeatureMatrix = __decorate([
    (0, typeorm_1.Entity)('user_project_feature_matrix'),
    (0, typeorm_1.Unique)(['userId', 'projectId'])
], UserProjectFeatureMatrix);
//# sourceMappingURL=user-project-feature-matrix.entity.js.map