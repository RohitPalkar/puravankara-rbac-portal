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
exports.ApprovalRequest = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../common/entities/app-base.entity");
const approval_workflow_entity_1 = require("./approval-workflow.entity");
const project_entity_1 = require("../../projects/entities/project.entity");
let ApprovalRequest = class ApprovalRequest extends app_base_entity_1.AppBaseEntity {
    workflowId;
    projectId;
    entityType;
    entityId;
    requestedBy;
    currentStep;
    status;
    completedAt;
    workflow;
    project;
};
exports.ApprovalRequest = ApprovalRequest;
__decorate([
    (0, typeorm_1.Column)({ name: 'workflow_id', nullable: false }),
    __metadata("design:type", Number)
], ApprovalRequest.prototype, "workflowId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id', nullable: true }),
    __metadata("design:type", Number)
], ApprovalRequest.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entity_type', nullable: true }),
    __metadata("design:type", String)
], ApprovalRequest.prototype, "entityType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entity_id', nullable: true }),
    __metadata("design:type", String)
], ApprovalRequest.prototype, "entityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requested_by', nullable: false }),
    __metadata("design:type", String)
], ApprovalRequest.prototype, "requestedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_step', nullable: true }),
    __metadata("design:type", Number)
], ApprovalRequest.prototype, "currentStep", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'PENDING' }),
    __metadata("design:type", String)
], ApprovalRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], ApprovalRequest.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => approval_workflow_entity_1.ApprovalWorkflow, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'workflow_id' }),
    __metadata("design:type", approval_workflow_entity_1.ApprovalWorkflow)
], ApprovalRequest.prototype, "workflow", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.Project)
], ApprovalRequest.prototype, "project", void 0);
exports.ApprovalRequest = ApprovalRequest = __decorate([
    (0, typeorm_1.Entity)('approval_requests')
], ApprovalRequest);
//# sourceMappingURL=approval-request.entity.js.map