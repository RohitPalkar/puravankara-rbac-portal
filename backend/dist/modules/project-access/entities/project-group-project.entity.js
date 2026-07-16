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
exports.ProjectGroupProject = void 0;
const typeorm_1 = require("typeorm");
const project_group_entity_1 = require("./project-group.entity");
const project_entity_1 = require("../../projects/entities/project.entity");
let ProjectGroupProject = class ProjectGroupProject {
    groupId;
    projectId;
    group;
    project;
    createdAt;
    updatedAt;
};
exports.ProjectGroupProject = ProjectGroupProject;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'group_id' }),
    __metadata("design:type", Number)
], ProjectGroupProject.prototype, "groupId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'project_id' }),
    __metadata("design:type", Number)
], ProjectGroupProject.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_group_entity_1.ProjectGroup, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'group_id' }),
    __metadata("design:type", project_group_entity_1.ProjectGroup)
], ProjectGroupProject.prototype, "group", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.Project)
], ProjectGroupProject.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ProjectGroupProject.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ProjectGroupProject.prototype, "updatedAt", void 0);
exports.ProjectGroupProject = ProjectGroupProject = __decorate([
    (0, typeorm_1.Entity)('project_group_projects')
], ProjectGroupProject);
//# sourceMappingURL=project-group-project.entity.js.map