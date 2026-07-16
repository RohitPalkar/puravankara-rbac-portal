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
exports.ApprovalRequestStep = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../common/entities/app-base.entity");
const approval_request_entity_1 = require("./approval-request.entity");
let ApprovalRequestStep = class ApprovalRequestStep extends app_base_entity_1.AppBaseEntity {
    requestId;
    stepOrder;
    approverId;
    status;
    comments;
    actionDate;
    request;
};
exports.ApprovalRequestStep = ApprovalRequestStep;
__decorate([
    (0, typeorm_1.Column)({ name: 'request_id', nullable: false }),
    __metadata("design:type", Number)
], ApprovalRequestStep.prototype, "requestId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'step_order', nullable: true }),
    __metadata("design:type", Number)
], ApprovalRequestStep.prototype, "stepOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approver_id', nullable: false }),
    __metadata("design:type", String)
], ApprovalRequestStep.prototype, "approverId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'PENDING' }),
    __metadata("design:type", String)
], ApprovalRequestStep.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ApprovalRequestStep.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'action_date', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], ApprovalRequestStep.prototype, "actionDate", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => approval_request_entity_1.ApprovalRequest, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'request_id' }),
    __metadata("design:type", approval_request_entity_1.ApprovalRequest)
], ApprovalRequestStep.prototype, "request", void 0);
exports.ApprovalRequestStep = ApprovalRequestStep = __decorate([
    (0, typeorm_1.Entity)('approval_request_steps')
], ApprovalRequestStep);
//# sourceMappingURL=approval-request-step.entity.js.map