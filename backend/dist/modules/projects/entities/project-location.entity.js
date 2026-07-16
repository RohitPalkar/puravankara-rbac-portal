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
exports.ProjectLocation = void 0;
const typeorm_1 = require("typeorm");
const project_entity_1 = require("./project.entity");
const city_entity_1 = require("../../geography/entities/city.entity");
const zone_entity_1 = require("../../geography/entities/zone.entity");
let ProjectLocation = class ProjectLocation {
    projectId;
    cityId;
    zoneId;
    project;
    city;
    zone;
    createdAt;
    updatedAt;
};
exports.ProjectLocation = ProjectLocation;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'project_id' }),
    __metadata("design:type", Number)
], ProjectLocation.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'city_id' }),
    __metadata("design:type", Number)
], ProjectLocation.prototype, "cityId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'zone_id' }),
    __metadata("design:type", Number)
], ProjectLocation.prototype, "zoneId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.Project)
], ProjectLocation.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => city_entity_1.City, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'city_id' }),
    __metadata("design:type", city_entity_1.City)
], ProjectLocation.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => zone_entity_1.Zone, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'zone_id' }),
    __metadata("design:type", zone_entity_1.Zone)
], ProjectLocation.prototype, "zone", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ProjectLocation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ProjectLocation.prototype, "updatedAt", void 0);
exports.ProjectLocation = ProjectLocation = __decorate([
    (0, typeorm_1.Entity)('project_locations')
], ProjectLocation);
//# sourceMappingURL=project-location.entity.js.map