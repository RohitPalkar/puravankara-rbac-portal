import { Repository } from 'typeorm';
import { ApprovalWorkflow } from '../entities/approval-workflow.entity';
import { ApprovalStep } from '../entities/approval-step.entity';
import { CreateWorkflowDto } from '../dto/create-workflow.dto';
export declare class WorkflowService {
    private readonly workflowRepo;
    private readonly stepRepo;
    private readonly logger;
    constructor(workflowRepo: Repository<ApprovalWorkflow>, stepRepo: Repository<ApprovalStep>);
    create(dto: CreateWorkflowDto): Promise<{
        workflow: ApprovalWorkflow;
        steps: ApprovalStep[];
    }>;
    findAll(): Promise<ApprovalWorkflow[]>;
    findById(id: number): Promise<ApprovalWorkflow>;
    getSteps(workflowId: number): Promise<ApprovalStep[]>;
}
