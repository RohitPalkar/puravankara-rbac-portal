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
exports.UserReportingLine = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let UserReportingLine = class UserReportingLine {
    userId;
    reportsToUserId;
    levelRank;
    effectiveFrom;
    effectiveTo;
    user;
    reportsTo;
    createdAt;
    updatedAt;
};
exports.UserReportingLine = UserReportingLine;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'user_id' }),
    __metadata("design:type", String)
], UserReportingLine.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'reports_to_user_id' }),
    __metadata("design:type", String)
], UserReportingLine.prototype, "reportsToUserId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'level_rank' }),
    __metadata("design:type", Number)
], UserReportingLine.prototype, "levelRank", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'effective_from', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], UserReportingLine.prototype, "effectiveFrom", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'effective_to', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], UserReportingLine.prototype, "effectiveTo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], UserReportingLine.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'reports_to_user_id' }),
    __metadata("design:type", user_entity_1.User)
], UserReportingLine.prototype, "reportsTo", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], UserReportingLine.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], UserReportingLine.prototype, "updatedAt", void 0);
exports.UserReportingLine = UserReportingLine = __decorate([
    (0, typeorm_1.Entity)('user_reporting_lines')
], UserReportingLine);
//# sourceMappingURL=user-reporting-line.entity.js.map