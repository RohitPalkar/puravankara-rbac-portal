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
exports.UserAuth = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
let UserAuth = class UserAuth {
    userId;
    passwordHash;
    authProvider;
    lastLogin;
    failedAttempts;
    isLocked;
    createdAt;
    updatedAt;
    user;
};
exports.UserAuth = UserAuth;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'user_id' }),
    __metadata("design:type", String)
], UserAuth.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'password_hash', nullable: true }),
    __metadata("design:type", String)
], UserAuth.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'auth_provider', default: 'LOCAL' }),
    __metadata("design:type", String)
], UserAuth.prototype, "authProvider", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_login', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], UserAuth.prototype, "lastLogin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failed_attempts', default: 0 }),
    __metadata("design:type", Number)
], UserAuth.prototype, "failedAttempts", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_locked', default: false }),
    __metadata("design:type", Boolean)
], UserAuth.prototype, "isLocked", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], UserAuth.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], UserAuth.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], UserAuth.prototype, "user", void 0);
exports.UserAuth = UserAuth = __decorate([
    (0, typeorm_1.Entity)('user_auth')
], UserAuth);
//# sourceMappingURL=user-auth.entity.js.map