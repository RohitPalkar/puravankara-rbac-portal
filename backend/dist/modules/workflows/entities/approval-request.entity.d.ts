import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { ApprovalWorkflow } from './approval-workflow.entity';
import { Project } from '../../projects/entities/project.entity';
export declare class ApprovalRequest extends AppBaseEntity {
    workflowId: number;
    projectId: number;
    entityType: string;
    entityId: string;
    requestedBy: string;
    currentStep: number;
    status: string;
    completedAt: Date;
    workflow: ApprovalWorkflow;
    project: Project;
}
