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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const workflow_service_1 = require("../services/workflow.service");
const approval_service_1 = require("../services/approval.service");
const submit_approval_dto_1 = require("../dto/submit-approval.dto");
const create_workflow_dto_1 = require("../dto/create-workflow.dto");
const require_permission_decorator_1 = require("../../permissions/decorators/require-permission.decorator");
let WorkflowController = class WorkflowController {
    workflowService;
    approvalService;
    constructor(workflowService, approvalService) {
        this.workflowService = workflowService;
        this.approvalService = approvalService;
    }
    async create(dto) {
        return this.workflowService.create(dto);
    }
    async findAll() {
        return this.workflowService.findAll();
    }
    async findById(id) {
        return this.workflowService.findById(+id);
    }
    async getSteps(id) {
        return this.workflowService.getSteps(+id);
    }
    async submit(workflowId, dto, req) {
        const userId = req.user.empId || req.user.userId;
        return this.approvalService.submit(+workflowId, dto, userId);
    }
};
exports.WorkflowController = WorkflowController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new workflow with approval steps' }),
    (0, require_permission_decorator_1.RequirePermission)({ module: 'WORKFLOW', action: 'CREATE' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_workflow_dto_1.CreateWorkflowDto]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all active workflows' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get workflow details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)(':id/steps'),
    (0, swagger_1.ApiOperation)({ summary: 'Get workflow approval steps' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "getSteps", null);
__decorate([
    (0, common_1.Post)(':workflowId/submit'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a new approval request' }),
    (0, require_permission_decorator_1.RequirePermission)({ module: 'IOM', action: 'CREATE' }),
    __param(0, (0, common_1.Param)('workflowId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, submit_approval_dto_1.SubmitApprovalDto, Object]),
    __metadata("design:returntype", Promise)
], WorkflowController.prototype, "submit", null);
exports.WorkflowController = WorkflowController = __decorate([
    (0, swagger_1.ApiTags)('Workflows'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('workflows'),
    __metadata("design:paramtypes", [workflow_service_1.WorkflowService,
        approval_service_1.ApprovalService])
], WorkflowController);
//# sourceMappingURL=workflow.controller.js.map