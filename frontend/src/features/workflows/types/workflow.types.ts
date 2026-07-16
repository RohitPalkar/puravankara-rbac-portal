export interface Workflow {
  id: string
  name: string
  module: string
  entityType: string
  isActive: boolean
  steps: WorkflowStep[]
  createdAt: string
  updatedAt?: string
}

export interface WorkflowStep {
  id: string
  workflowId: string
  stepOrder: number
  roleId: string
  roleName?: string
  approvalType: 'ANY' | 'ALL'
}

export interface CreateWorkflowPayload {
  name: string
  module: string
  entityType: string
}

export interface UpdateWorkflowPayload {
  name?: string
  module?: string
  entityType?: string
  isActive?: boolean
}

export interface SaveWorkflowStepsPayload {
  workflowId: string
  steps: { roleId: string; approvalType: 'ANY' | 'ALL' }[]
}

export interface ApprovalRequest {
  id: string
  workflowId: string
  workflowName?: string
  module: string
  entityType: string
  entityId: string
  requestedBy: string
  requestedByName?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  currentStep: number
  totalSteps: number
  createdAt: string
  updatedAt?: string
}

export interface ApprovalActionPayload {
  action: 'APPROVE' | 'REJECT'
  comments: string
}

export interface ApprovalTimelineEntry {
  id: string
  stepOrder: number
  roleName: string
  userName?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  comments?: string
  actedAt?: string
}

export interface Delegation {
  id: string
  fromUserId: string
  fromUserName?: string
  delegateUserId: string
  delegateUserName?: string
  departmentId?: string
  roleId?: string
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
}

export interface CreateDelegationPayload {
  fromUserId: string
  delegateUserId: string
  departmentId?: string
  roleId?: string
  startDate: string
  endDate: string
}
