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
exports.ProjectGroup = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../common/entities/app-base.entity");
const project_group_project_entity_1 = require("./project-group-project.entity");
let ProjectGroup = class ProjectGroup extends app_base_entity_1.AppBaseEntity {
    name;
    description;
    isActive;
    projectGroupProjects;
};
exports.ProjectGroup = ProjectGroup;
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: false }),
    __metadata("design:type", String)
], ProjectGroup.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProjectGroup.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], ProjectGroup.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => project_group_project_entity_1.ProjectGroupProject, (pgp) => pgp.group),
    __metadata("design:type", Array)
], ProjectGroup.prototype, "projectGroupProjects", void 0);
exports.ProjectGroup = ProjectGroup = __decorate([
    (0, typeorm_1.Entity)('project_groups')
], ProjectGroup);
//# sourceMappingURL=project-group.entity.js.map