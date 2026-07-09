import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api/axios'
import type {
  Workflow,
  WorkflowStep,
  ApprovalRequest,
  ApprovalTimelineEntry,
  Delegation,
  CreateWorkflowPayload,
  UpdateWorkflowPayload,
  SaveWorkflowStepsPayload,
  ApprovalActionPayload,
  CreateDelegationPayload,
} from '@/features/workflows/types/workflow.types'

// ──────────────────────────
// Workflows
// ──────────────────────────

const fetchWorkflows = async (): Promise<Workflow[]> => {
  const res = await api.get('/workflows')
  const data = res.data.data
  return (Array.isArray(data) ? data : data.items ?? []) as Workflow[]
}

const fetchWorkflow = async (id: string): Promise<Workflow> => {
  const res = await api.get(`/workflows/${id}`)
  return res.data.data as Workflow
}

const createWorkflow = async (payload: CreateWorkflowPayload): Promise<Workflow> => {
  const res = await api.post('/workflows', payload)
  return res.data.data as Workflow
}

const updateWorkflow = async ({ id, payload }: { id: string; payload: UpdateWorkflowPayload }): Promise<Workflow> => {
  const res = await api.patch(`/workflows/${id}`, payload)
  return res.data.data as Workflow
}

const deleteWorkflow = async (id: string): Promise<void> => {
  await api.delete(`/workflows/${id}`)
}

const fetchWorkflowSteps = async (workflowId: string): Promise<WorkflowStep[]> => {
  const res = await api.get(`/workflows/${workflowId}/steps`)
  const data = res.data.data
  return (Array.isArray(data) ? data : data.items ?? []) as WorkflowStep[]
}

const saveWorkflowSteps = async (payload: SaveWorkflowStepsPayload): Promise<WorkflowStep[]> => {
  const res = await api.post(`/workflows/${payload.workflowId}/steps`, payload)
  return res.data.data as WorkflowStep[]
}

export function useWorkflows() {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: fetchWorkflows,
  })
}

export function useWorkflow(id: string | undefined) {
  return useQuery({
    queryKey: ['workflow', id],
    queryFn: () => fetchWorkflow(id!),
    enabled: !!id,
  })
}

export function useCreateWorkflow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createWorkflow,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workflows'] }),
  })
}

export function useUpdateWorkflow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateWorkflow,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workflows'] }),
  })
}

export function useDeleteWorkflow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteWorkflow,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workflows'] }),
  })
}

export function useWorkflowSteps(workflowId: string | undefined) {
  return useQuery({
    queryKey: ['workflow-steps', workflowId],
    queryFn: () => fetchWorkflowSteps(workflowId!),
    enabled: !!workflowId,
  })
}

export function useSaveWorkflowSteps() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: saveWorkflowSteps,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workflow-steps'] })
      qc.invalidateQueries({ queryKey: ['workflows'] })
    },
  })
}

// ──────────────────────────
// Approvals
// ──────────────────────────

const fetchPendingApprovals = async (): Promise<ApprovalRequest[]> => {
  const res = await api.get('/approvals/pending')
  const data = res.data.data
  return (Array.isArray(data) ? data : data.items ?? []) as ApprovalRequest[]
}

const fetchSubmittedApprovals = async (): Promise<ApprovalRequest[]> => {
  const res = await api.get('/approvals/submitted')
  const data = res.data.data
  return (Array.isArray(data) ? data : data.items ?? []) as ApprovalRequest[]
}

const fetchApprovalDetail = async (id: string): Promise<ApprovalRequest> => {
  const res = await api.get(`/approvals/${id}`)
  return res.data.data as ApprovalRequest
}

const fetchApprovalTimeline = async (approvalId: string): Promise<ApprovalTimelineEntry[]> => {
  const res = await api.get(`/approvals/${approvalId}/timeline`)
  const data = res.data.data
  return (Array.isArray(data) ? data : data.items ?? []) as ApprovalTimelineEntry[]
}

const performApprovalAction = async ({ id, payload }: { id: string; payload: ApprovalActionPayload }): Promise<void> => {
  await api.post(`/approvals/${id}/action`, payload)
}

export function usePendingApprovals() {
  return useQuery({
    queryKey: ['approvals', 'pending'],
    queryFn: fetchPendingApprovals,
  })
}

export function useSubmittedApprovals() {
  return useQuery({
    queryKey: ['approvals', 'submitted'],
    queryFn: fetchSubmittedApprovals,
  })
}

export function useApprovalDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['approval', id],
    queryFn: () => fetchApprovalDetail(id!),
    enabled: !!id,
  })
}

export function useApprovalTimeline(approvalId: string | undefined) {
  return useQuery({
    queryKey: ['approval-timeline', approvalId],
    queryFn: () => fetchApprovalTimeline(approvalId!),
    enabled: !!approvalId,
  })
}

export function useApprovalAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: performApprovalAction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['approvals'] })
    },
  })
}

// ──────────────────────────
// Delegations
// ──────────────────────────

const fetchDelegations = async (): Promise<Delegation[]> => {
  const res = await api.get('/delegations')
  const data = res.data.data
  return (Array.isArray(data) ? data : data.items ?? []) as Delegation[]
}

const createDelegation = async (payload: CreateDelegationPayload): Promise<Delegation> => {
  const res = await api.post('/delegations', payload)
  return res.data.data as Delegation
}

const deleteDelegation = async (id: string): Promise<void> => {
  await api.delete(`/delegations/${id}`)
}

export function useDelegations() {
  return useQuery({
    queryKey: ['delegations'],
    queryFn: fetchDelegations,
  })
}

export function useCreateDelegation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createDelegation,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['delegations'] }),
  })
}

export function useDeleteDelegation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteDelegation,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['delegations'] }),
  })
}
