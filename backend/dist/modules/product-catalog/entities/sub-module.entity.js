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
exports.SubModule = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../common/entities/app-base.entity");
const module_entity_1 = require("./module.entity");
let SubModule = class SubModule extends app_base_entity_1.AppBaseEntity {
    moduleId;
    name;
    isActive;
    module;
};
exports.SubModule = SubModule;
__decorate([
    (0, typeorm_1.Column)({ name: 'module_id', nullable: false }),
    __metadata("design:type", Number)
], SubModule.prototype, "moduleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], SubModule.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], SubModule.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => module_entity_1.Module, (m) => m.subModules, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'module_id' }),
    __metadata("design:type", module_entity_1.Module)
], SubModule.prototype, "module", void 0);
exports.SubModule = SubModule = __decorate([
    (0, typeorm_1.Entity)('sub_modules'),
    (0, typeorm_1.Unique)(['moduleId', 'name'])
], SubModule);
//# sourceMappingURL=sub-module.entity.js.map