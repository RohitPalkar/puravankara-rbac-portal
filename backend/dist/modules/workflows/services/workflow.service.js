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
var WorkflowService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const approval_workflow_entity_1 = require("../entities/approval-workflow.entity");
const approval_step_entity_1 = require("../entities/approval-step.entity");
let WorkflowService = WorkflowService_1 = class WorkflowService {
    workflowRepo;
    stepRepo;
    logger = new common_1.Logger(WorkflowService_1.name);
    constructor(workflowRepo, stepRepo) {
        this.workflowRepo = workflowRepo;
        this.stepRepo = stepRepo;
    }
    async create(dto) {
        const workflow = this.workflowRepo.create({
            name: dto.name,
            moduleId: dto.moduleId,
            subModuleId: dto.subModuleId,
            actionId: dto.actionId,
            isActive: true,
        });
        const saved = await this.workflowRepo.save(workflow);
        const stepEntities = dto.steps.map((step) => this.stepRepo.create({
            workflowId: saved.id,
            stepOrder: step.stepOrder,
            roleId: step.roleId,
            approvalType: step.approvalType,
            departmentId: step.departmentId,
            levelRank: step.levelRank,
            isMandatory: step.isMandatory ?? true,
        }));
        const steps = await this.stepRepo.save(stepEntities);
        return {
            workflow: await this.workflowRepo.findOne({
                where: { id: saved.id },
                relations: { module: true },
            }),
            steps: steps.sort((a, b) => a.stepOrder - b.stepOrder),
        };
    }
    async findAll() {
        return this.workflowRepo.find({ where: { isActive: true } });
    }
    async findById(id) {
        const wf = await this.workflowRepo.findOne({
            where: { id },
            relations: { module: true },
        });
        if (!wf)
            throw new common_1.NotFoundException('Workflow not found');
        return wf;
    }
    async getSteps(workflowId) {
        const wf = await this.workflowRepo.findOne({ where: { id: workflowId } });
        if (!wf)
            throw new common_1.NotFoundException('Workflow not found');
        return this.stepRepo.find({
            where: { workflowId },
            order: { stepOrder: 'ASC' },
            relations: { department: true, role: true },
        });
    }
};
exports.WorkflowService = WorkflowService;
exports.WorkflowService = WorkflowService = WorkflowService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(approval_workflow_entity_1.ApprovalWorkflow)),
    __param(1, (0, typeorm_1.InjectRepository)(approval_step_entity_1.ApprovalStep)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], WorkflowService);
//# sourceMappingURL=workflow.service.js.map