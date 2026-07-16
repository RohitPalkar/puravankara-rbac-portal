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
exports.ActionPermissionScope = void 0;
const typeorm_1 = require("typeorm");
const action_entity_1 = require("../../product-catalog/entities/action.entity");
const permission_scope_entity_1 = require("./permission-scope.entity");
let ActionPermissionScope = class ActionPermissionScope {
    actionId;
    scopeId;
    action;
    scope;
    createdAt;
    updatedAt;
};
exports.ActionPermissionScope = ActionPermissionScope;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'action_id' }),
    __metadata("design:type", Number)
], ActionPermissionScope.prototype, "actionId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'scope_id' }),
    __metadata("design:type", Number)
], ActionPermissionScope.prototype, "scopeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => action_entity_1.Action, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'action_id' }),
    __metadata("design:type", action_entity_1.Action)
], ActionPermissionScope.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => permission_scope_entity_1.PermissionScope, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'scope_id' }),
    __metadata("design:type", permission_scope_entity_1.PermissionScope)
], ActionPermissionScope.prototype, "scope", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ActionPermissionScope.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ActionPermissionScope.prototype, "updatedAt", void 0);
exports.ActionPermissionScope = ActionPermissionScope = __decorate([
    (0, typeorm_1.Entity)('action_permission_scopes')
], ActionPermissionScope);
//# sourceMappingURL=action-permission-scope.entity.js.map