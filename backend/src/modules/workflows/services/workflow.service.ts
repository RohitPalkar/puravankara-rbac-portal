import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalWorkflow } from '../entities/approval-workflow.entity';
import { ApprovalStep } from '../entities/approval-step.entity';
import { SubmitApprovalDto } from '../dto/submit-approval.dto';
import { CreateWorkflowDto } from '../dto/create-workflow.dto';

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    @InjectRepository(ApprovalWorkflow)
    private readonly workflowRepo: Repository<ApprovalWorkflow>,
    @InjectRepository(ApprovalStep)
    private readonly stepRepo: Repository<ApprovalStep>,
  ) {}

  async create(
    dto: CreateWorkflowDto,
  ): Promise<{ workflow: ApprovalWorkflow; steps: ApprovalStep[] }> {
    const workflow = this.workflowRepo.create({
      name: dto.name,
      moduleId: dto.moduleId,
      subModuleId: dto.subModuleId,
      actionId: dto.actionId,
      isActive: true,
    });
    const saved = await this.workflowRepo.save(workflow);

    const stepEntities = dto.steps.map((step) =>
      this.stepRepo.create({
        workflowId: saved.id,
        stepOrder: step.stepOrder,
        roleId: step.roleId,
        approvalType: step.approvalType,
        departmentId: step.departmentId,
        levelRank: step.levelRank,
        isMandatory: step.isMandatory ?? true,
      }),
    );
    const steps = await this.stepRepo.save(stepEntities);

    return {
      workflow: await this.workflowRepo.findOne({
        where: { id: saved.id },
        relations: { module: true },
      }),
      steps: steps.sort((a, b) => a.stepOrder - b.stepOrder),
    };
  }

  async findAll(): Promise<ApprovalWorkflow[]> {
    return this.workflowRepo.find({ where: { isActive: true } });
  }

  async findById(id: number): Promise<ApprovalWorkflow> {
    const wf = await this.workflowRepo.findOne({
      where: { id },
      relations: { module: true },
    });
    if (!wf) throw new NotFoundException('Workflow not found');
    return wf;
  }

  async getSteps(workflowId: number): Promise<ApprovalStep[]> {
    const wf = await this.workflowRepo.findOne({ where: { id: workflowId } });
    if (!wf) throw new NotFoundException('Workflow not found');

    return this.stepRepo.find({
      where: { workflowId },
      order: { stepOrder: 'ASC' },
      relations: { department: true, role: true },
    });
  }
}
