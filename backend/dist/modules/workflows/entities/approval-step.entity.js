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
exports.ApprovalStep = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../common/entities/app-base.entity");
const approval_workflow_entity_1 = require("./approval-workflow.entity");
const department_entity_1 = require("../../organization/entities/department.entity");
const role_entity_1 = require("../../organization/entities/role.entity");
let ApprovalStep = class ApprovalStep extends app_base_entity_1.AppBaseEntity {
    workflowId;
    stepOrder;
    departmentId;
    roleId;
    levelRank;
    approvalType;
    isMandatory;
    workflow;
    department;
    role;
};
exports.ApprovalStep = ApprovalStep;
__decorate([
    (0, typeorm_1.Column)({ name: 'workflow_id', nullable: false }),
    __metadata("design:type", Number)
], ApprovalStep.prototype, "workflowId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'step_order', nullable: false }),
    __metadata("design:type", Number)
], ApprovalStep.prototype, "stepOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'department_id', nullable: true }),
    __metadata("design:type", Number)
], ApprovalStep.prototype, "departmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'role_id', nullable: false }),
    __metadata("design:type", Number)
], ApprovalStep.prototype, "roleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'level_rank', nullable: true }),
    __metadata("design:type", Number)
], ApprovalStep.prototype, "levelRank", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approval_type', length: 20, nullable: false }),
    __metadata("design:type", String)
], ApprovalStep.prototype, "approvalType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_mandatory', default: true }),
    __metadata("design:type", Boolean)
], ApprovalStep.prototype, "isMandatory", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => approval_workflow_entity_1.ApprovalWorkflow, { nullable: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'workflow_id' }),
    __metadata("design:type", approval_workflow_entity_1.ApprovalWorkflow)
], ApprovalStep.prototype, "workflow", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => department_entity_1.Department, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'department_id' }),
    __metadata("design:type", department_entity_1.Department)
], ApprovalStep.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => role_entity_1.Role, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'role_id' }),
    __metadata("design:type", role_entity_1.Role)
], ApprovalStep.prototype, "role", void 0);
exports.ApprovalStep = ApprovalStep = __decorate([
    (0, typeorm_1.Entity)('approval_steps'),
    (0, typeorm_1.Unique)(['workflowId', 'stepOrder'])
], ApprovalStep);
//# sourceMappingURL=approval-step.entity.js.map