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
exports.ApprovalHistoryResponse = exports.ApprovalStepResponse = void 0;
const swagger_1 = require("@nestjs/swagger");
class ApprovalStepResponse {
    id;
    stepOrder;
    approverId;
    status;
    comments;
    actionDate;
}
exports.ApprovalStepResponse = ApprovalStepResponse;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ApprovalStepResponse.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ApprovalStepResponse.prototype, "stepOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ApprovalStepResponse.prototype, "approverId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ApprovalStepResponse.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], ApprovalStepResponse.prototype, "comments", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], ApprovalStepResponse.prototype, "actionDate", void 0);
class ApprovalHistoryResponse {
    id;
    workflowId;
    projectId;
    entityType;
    entityId;
    requestedBy;
    status;
    currentStep;
    completedAt;
    steps;
}
exports.ApprovalHistoryResponse = ApprovalHistoryResponse;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ApprovalHistoryResponse.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ApprovalHistoryResponse.prototype, "workflowId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], ApprovalHistoryResponse.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], ApprovalHistoryResponse.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], ApprovalHistoryResponse.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ApprovalHistoryResponse.prototype, "requestedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ApprovalHistoryResponse.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], ApprovalHistoryResponse.prototype, "currentStep", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], ApprovalHistoryResponse.prototype, "completedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ApprovalStepResponse] }),
    __metadata("design:type", Array)
], ApprovalHistoryResponse.prototype, "steps", void 0);
//# sourceMappingURL=approval-history.dto.js.map