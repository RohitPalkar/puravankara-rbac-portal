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
exports.UserDelegation = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../common/entities/app-base.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const module_entity_1 = require("../../product-catalog/entities/module.entity");
let UserDelegation = class UserDelegation extends app_base_entity_1.AppBaseEntity {
    fromUserId;
    fromUser;
    toUserId;
    toUser;
    moduleId;
    startDate;
    endDate;
    reason;
    isActive;
    module;
};
exports.UserDelegation = UserDelegation;
__decorate([
    (0, typeorm_1.Column)({ name: 'from_user_id', nullable: false }),
    __metadata("design:type", String)
], UserDelegation.prototype, "fromUserId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'from_user_id' }),
    __metadata("design:type", user_entity_1.User)
], UserDelegation.prototype, "fromUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'to_user_id', nullable: false }),
    __metadata("design:type", String)
], UserDelegation.prototype, "toUserId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'to_user_id' }),
    __metadata("design:type", user_entity_1.User)
], UserDelegation.prototype, "toUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'module_id', nullable: true }),
    __metadata("design:type", Number)
], UserDelegation.prototype, "moduleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], UserDelegation.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], UserDelegation.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserDelegation.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], UserDelegation.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => module_entity_1.Module, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'module_id' }),
    __metadata("design:type", module_entity_1.Module)
], UserDelegation.prototype, "module", void 0);
exports.UserDelegation = UserDelegation = __decorate([
    (0, typeorm_1.Entity)('user_delegations')
], UserDelegation);
//# sourceMappingURL=user-delegation.entity.js.map