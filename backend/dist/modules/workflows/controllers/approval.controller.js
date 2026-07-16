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
exports.ApprovalController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const approval_service_1 = require("../services/approval.service");
const approval_action_dto_1 = require("../dto/approval-action.dto");
const require_permission_decorator_1 = require("../../permissions/decorators/require-permission.decorator");
let ApprovalController = class ApprovalController {
    approvalService;
    constructor(approvalService) {
        this.approvalService = approvalService;
    }
    async getPending(req) {
        const userId = req.user.empId || req.user.userId;
        return this.approvalService.getPending(userId);
    }
    async getSubmitted(req) {
        const userId = req.user.empId || req.user.userId;
        return this.approvalService.getSubmitted(userId);
    }
    async getDetail(id) {
        return this.approvalService.getDetail(+id);
    }
    async performAction(requestId, dto, req) {
        const userId = req.user.empId || req.user.userId;
        return this.approvalService.performAction(+requestId, dto.action, userId, dto.comments);
    }
};
exports.ApprovalController = ApprovalController;
__decorate([
    (0, common_1.Get)('pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my pending approvals' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApprovalController.prototype, "getPending", null);
__decorate([
    (0, common_1.Get)('submitted'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my submitted requests' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApprovalController.prototype, "getSubmitted", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get approval request detail with step history' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApprovalController.prototype, "getDetail", null);
__decorate([
    (0, common_1.Post)(':requestId/action'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve or reject the current step' }),
    (0, require_permission_decorator_1.RequirePermission)({ module: 'IOM', action: 'APPROVE' }),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, approval_action_dto_1.ApprovalActionDto, Object]),
    __metadata("design:returntype", Promise)
], ApprovalController.prototype, "performAction", null);
exports.ApprovalController = ApprovalController = __decorate([
    (0, swagger_1.ApiTags)('Approvals'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('approvals'),
    __metadata("design:paramtypes", [approval_service_1.ApprovalService])
], ApprovalController);
//# sourceMappingURL=approval.controller.js.map