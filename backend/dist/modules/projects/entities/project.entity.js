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
exports.Project = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../common/entities/app-base.entity");
const project_location_entity_1 = require("./project-location.entity");
let Project = class Project extends app_base_entity_1.AppBaseEntity {
    name;
    billingEntityName;
    billingGstin;
    isActive;
    extendedMetadata;
    locations;
};
exports.Project = Project;
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: false }),
    __metadata("design:type", String)
], Project.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'billing_entity_name', nullable: true }),
    __metadata("design:type", String)
], Project.prototype, "billingEntityName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'billing_gstin', nullable: true }),
    __metadata("design:type", String)
], Project.prototype, "billingGstin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Project.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'extended_metadata', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Project.prototype, "extendedMetadata", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => project_location_entity_1.ProjectLocation, (pl) => pl.project),
    __metadata("design:type", Array)
], Project.prototype, "locations", void 0);
exports.Project = Project = __decorate([
    (0, typeorm_1.Entity)('projects')
], Project);
//# sourceMappingURL=project.entity.js.map