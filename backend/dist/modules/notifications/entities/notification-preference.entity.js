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
exports.NotificationPreference = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../common/entities/app-base.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let NotificationPreference = class NotificationPreference extends app_base_entity_1.AppBaseEntity {
    userId;
    user;
    emailEnabled;
    inAppEnabled;
    pushEnabled;
};
exports.NotificationPreference = NotificationPreference;
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', unique: true, nullable: false }),
    __metadata("design:type", String)
], NotificationPreference.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], NotificationPreference.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email_enabled', default: true }),
    __metadata("design:type", Boolean)
], NotificationPreference.prototype, "emailEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'in_app_enabled', default: true }),
    __metadata("design:type", Boolean)
], NotificationPreference.prototype, "inAppEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'push_enabled', default: false }),
    __metadata("design:type", Boolean)
], NotificationPreference.prototype, "pushEnabled", void 0);
exports.NotificationPreference = NotificationPreference = __decorate([
    (0, typeorm_1.Entity)('notification_preferences')
], NotificationPreference);
//# sourceMappingURL=notification-preference.entity.js.map