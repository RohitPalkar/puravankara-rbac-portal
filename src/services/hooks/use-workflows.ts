import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../api/query-keys';
import { workflowService } from '../services/workflow.service';

import type { CreateWorkflowRequest, SubmitApprovalRequest, ApprovalActionRequest } from '../types/workflow';

export function useWorkflowList() {
  return useQuery({
    queryKey: queryKeys.workflows.all,
    queryFn: async () => {
      const res = await workflowService.list();
      return res.data;
    },
  });
}

export function useWorkflowById(id: number) {
  return useQuery({
    queryKey: queryKeys.workflows.byId(id),
    queryFn: async () => {
      const res = await workflowService.byId(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWorkflowRequest) => {
      const res = await workflowService.create(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.all });
    },
  });
}

export function useWorkflowSteps(workflowId: number) {
  return useQuery({
    queryKey: queryKeys.workflows.steps(workflowId),
    queryFn: async () => {
      const res = await workflowService.steps(workflowId);
      return res.data;
    },
    enabled: !!workflowId,
  });
}

export function useSubmitApproval(workflowId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SubmitApprovalRequest) => {
      const res = await workflowService.submit(workflowId, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.approvals.submitted });
    },
  });
}

export function usePendingApprovals() {
  return useQuery({
    queryKey: queryKeys.workflows.approvals.pending,
    queryFn: async () => {
      const res = await workflowService.approvals.pending();
      return res.data;
    },
  });
}

export function useSubmittedApprovals() {
  return useQuery({
    queryKey: queryKeys.workflows.approvals.submitted,
    queryFn: async () => {
      const res = await workflowService.approvals.submitted();
      return res.data;
    },
  });
}

export function useApprovalById(id: number) {
  return useQuery({
    queryKey: queryKeys.workflows.approvals.byId(id),
    queryFn: async () => {
      const res = await workflowService.approvals.byId(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useApprovalAction(requestId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ApprovalActionRequest) => {
      const res = await workflowService.approvals.action(requestId, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.approvals.pending });
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.approvals.submitted });
    },
  });
}
