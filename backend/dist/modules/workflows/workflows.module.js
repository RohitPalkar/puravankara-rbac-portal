"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const approval_workflow_entity_1 = require("./entities/approval-workflow.entity");
const approval_step_entity_1 = require("./entities/approval-step.entity");
const approval_request_entity_1 = require("./entities/approval-request.entity");
const approval_request_step_entity_1 = require("./entities/approval-request-step.entity");
const user_entity_1 = require("../users/entities/user.entity");
const user_role_entity_1 = require("../users/entities/user-role.entity");
const user_delegation_entity_1 = require("../delegation/entities/user-delegation.entity");
const module_entity_1 = require("../product-catalog/entities/module.entity");
const workflow_service_1 = require("./services/workflow.service");
const approval_service_1 = require("./services/approval.service");
const delegation_service_1 = require("./services/delegation.service");
const workflow_controller_1 = require("./controllers/workflow.controller");
const approval_controller_1 = require("./controllers/approval.controller");
const audit_module_1 = require("../audit/audit.module");
const notifications_module_1 = require("../notifications/notifications.module");
let WorkflowsModule = class WorkflowsModule {
};
exports.WorkflowsModule = WorkflowsModule;
exports.WorkflowsModule = WorkflowsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                approval_workflow_entity_1.ApprovalWorkflow,
                approval_step_entity_1.ApprovalStep,
                approval_request_entity_1.ApprovalRequest,
                approval_request_step_entity_1.ApprovalRequestStep,
                user_entity_1.User,
                user_role_entity_1.UserRole,
                user_delegation_entity_1.UserDelegation,
                module_entity_1.Module,
            ]),
            audit_module_1.AuditModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [workflow_controller_1.WorkflowController, approval_controller_1.ApprovalController],
        providers: [workflow_service_1.WorkflowService, approval_service_1.ApprovalService, delegation_service_1.DelegationService],
        exports: [workflow_service_1.WorkflowService, approval_service_1.ApprovalService, delegation_service_1.DelegationService, typeorm_1.TypeOrmModule],
    })
], WorkflowsModule);
//# sourceMappingURL=workflows.module.js.map