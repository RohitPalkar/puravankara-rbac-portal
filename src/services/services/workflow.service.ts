import { apiGet, apiPost } from '../api/client';
import { getById } from '../api/crud';
import { endpoints } from '../api/endpoints';
import type { ApiResponse } from '../types/api';
import type {
  ApprovalWorkflow,
  CreateWorkflowRequest,
  ApprovalStep,
  ApprovalRequest,
  SubmitApprovalRequest,
  ApprovalActionRequest,
} from '../types/workflow';

export const workflowService = {
  list: async (): Promise<ApiResponse<ApprovalWorkflow[]>> =>
    apiGet<ApprovalWorkflow[]>(endpoints.workflows.list),

  byId: async (id: number): Promise<ApiResponse<ApprovalWorkflow>> =>
    getById<ApprovalWorkflow>(endpoints.workflows.byId(id)),

  create: async (data: CreateWorkflowRequest): Promise<ApiResponse<ApprovalWorkflow>> =>
    apiPost<ApprovalWorkflow>(endpoints.workflows.create, data),

  steps: async (workflowId: number): Promise<ApiResponse<ApprovalStep[]>> =>
    apiGet<ApprovalStep[]>(endpoints.workflows.steps(workflowId)),

  submit: async (
    workflowId: number,
    data: SubmitApprovalRequest
  ): Promise<ApiResponse<ApprovalRequest>> =>
    apiPost<ApprovalRequest>(endpoints.workflows.submit(workflowId), data),

  approvals: {
    pending: async (): Promise<ApiResponse<ApprovalRequest[]>> =>
      apiGet<ApprovalRequest[]>(endpoints.workflows.approvals.pending),

    submitted: async (): Promise<ApiResponse<ApprovalRequest[]>> =>
      apiGet<ApprovalRequest[]>(endpoints.workflows.approvals.submitted),

    byId: async (id: number): Promise<ApiResponse<ApprovalRequest>> =>
      getById<ApprovalRequest>(endpoints.workflows.approvals.byId(id)),

    action: async (
      requestId: number,
      data: ApprovalActionRequest
    ): Promise<ApiResponse<ApprovalRequest>> =>
      apiPost<ApprovalRequest>(endpoints.workflows.approvals.action(requestId), data),
  },
};
