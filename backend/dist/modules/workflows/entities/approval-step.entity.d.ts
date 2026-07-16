import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { ApprovalWorkflow } from './approval-workflow.entity';
import { Department } from '../../organization/entities/department.entity';
import { Role } from '../../organization/entities/role.entity';
export declare class ApprovalStep extends AppBaseEntity {
    workflowId: number;
    stepOrder: number;
    departmentId: number | null;
    roleId: number;
    levelRank: number | null;
    approvalType: string;
    isMandatory: boolean;
    workflow: ApprovalWorkflow;
    department: Department;
    role: Role;
}
