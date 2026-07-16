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
exports.Role = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../common/entities/app-base.entity");
let Role = class Role extends app_base_entity_1.AppBaseEntity {
    name;
    hierarchyLevelRank;
    isActive;
    isSystemRole;
};
exports.Role = Role;
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Role.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hierarchy_level_rank', nullable: false }),
    __metadata("design:type", Number)
], Role.prototype, "hierarchyLevelRank", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Role.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_system_role', default: false }),
    __metadata("design:type", Boolean)
], Role.prototype, "isSystemRole", void 0);
exports.Role = Role = __decorate([
    (0, typeorm_1.Entity)('roles'),
    (0, typeorm_1.Unique)(['name'])
], Role);
//# sourceMappingURL=role.entity.js.map