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
exports.DepartmentRole = void 0;
const typeorm_1 = require("typeorm");
const department_entity_1 = require("./department.entity");
const role_entity_1 = require("./role.entity");
let DepartmentRole = class DepartmentRole {
    departmentId;
    roleId;
    department;
    role;
    createdAt;
    updatedAt;
};
exports.DepartmentRole = DepartmentRole;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'department_id' }),
    __metadata("design:type", Number)
], DepartmentRole.prototype, "departmentId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'role_id' }),
    __metadata("design:type", Number)
], DepartmentRole.prototype, "roleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => department_entity_1.Department, { nullable: false, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'department_id' }),
    __metadata("design:type", department_entity_1.Department)
], DepartmentRole.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => role_entity_1.Role, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'role_id' }),
    __metadata("design:type", role_entity_1.Role)
], DepartmentRole.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], DepartmentRole.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], DepartmentRole.prototype, "updatedAt", void 0);
exports.DepartmentRole = DepartmentRole = __decorate([
    (0, typeorm_1.Entity)('department_roles')
], DepartmentRole);
//# sourceMappingURL=department-role.entity.js.map