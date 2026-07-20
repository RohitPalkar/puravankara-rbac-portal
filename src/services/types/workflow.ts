import { AppBase } from './common';
import { ApprovalStatus } from './enums';

export interface ApprovalWorkflow extends AppBase {
  name: string;
  moduleId: number;
  moduleName?: string;
  subModuleId?: number;
  subModuleName?: string;
  actionId: number;
  actionName?: string;
  isActive: boolean;
  steps?: ApprovalStep[];
}

export interface ApprovalStep extends AppBase {
  workflowId: number;
  stepOrder: number;
  departmentId?: number;
  departmentName?: string;
  roleId: number;
  roleName?: string;
  levelRank?: number;
  approvalType: string;
  isMandatory: boolean;
}

export interface CreateWorkflowStepRequest {
  stepOrder: number;
  roleId: number;
  approvalType: string;
  departmentId?: number;
  levelRank?: number;
  isMandatory?: boolean;
}

export interface CreateWorkflowRequest {
  name: string;
  moduleId: number;
  subModuleId?: number;
  actionId: number;
  steps: CreateWorkflowStepRequest[];
}

export interface ApprovalRequest extends AppBase {
  workflowId: number;
  projectId?: number;
  entityType?: string;
  entityId?: string;
  requestedBy: string;
  requestorName?: string;
  currentStep: number;
  status: ApprovalStatus;
  completedAt?: string;
  steps?: ApprovalRequestStep[];
}

export interface ApprovalRequestStep extends AppBase {
  requestId: number;
  stepOrder: number;
  approverId?: string;
  approverName?: string;
  status: ApprovalStatus;
  comments?: string;
  actionDate?: string;
}

export interface SubmitApprovalRequest {
  projectId: number;
  entityType?: string;
  entityId?: string;
}

export interface ApprovalActionRequest {
  action: 'APPROVE' | 'REJECT';
  comments?: string;
}
