# Phase 6 Report: Workflow + Approval Management

## Completed

### Types (`features/workflows/types/workflow.types.ts`)
- `Workflow` / `WorkflowStep` — workflow definition with step chain
- `ApprovalRequest` — approval instance (status, current step, requester)
- `ApprovalTimelineEntry` — step-level timeline (who acted, when, comments)
- `Delegation` / `CreateDelegationPayload` — delegation management types
- `CreateWorkflowPayload`, `UpdateWorkflowPayload`, `SaveWorkflowStepsPayload`, `ApprovalActionPayload`

### Service (`features/workflows/services/workflow.service.ts`)
- **Workflows**: `useWorkflows`, `useWorkflow`, `useCreateWorkflow`, `useUpdateWorkflow`, `useDeleteWorkflow`, `useWorkflowSteps`, `useSaveWorkflowSteps`
- **Approvals**: `usePendingApprovals`, `useSubmittedApprovals`, `useApprovalDetail`, `useApprovalTimeline`, `useApprovalAction`
- **Delegations**: `useDelegations`, `useCreateDelegation`, `useDeleteDelegation`

### Components
- **`WorkflowStepBuilder`** — Dynamic step list with role selector, approval type (ANY/ALL), add/remove/reorder, step number badges
- **`ApprovalCard`** — Card view for approval requests (status chip, step indicator, Approve/Reject/View buttons)
- **`ApprovalTimeline`** — Vertical MUI Stepper showing step-by-step approval chain with user, date, comments
- **`DelegationForm`** — Form with From User, Delegate To (excludes self), Start/End Date with validation

### Pages
- **`WorkflowListPage`** — DataTable of all workflows with edit steps / delete actions
- **`WorkflowBuilderPage`** — Create/edit workflow with name/module/entityType + step builder; department selector populates roles; saves workflow + steps in sequence
- **`ApprovalInboxPage`** — List of pending approvals with Approve/Reject action dialogs; comments required on reject; detail dialog shows timeline
- **`ApprovalHistoryPage`** — List of submitted requests (my requests), read-only detail with timeline
- **`DelegationPage`** — List of delegations with create dialog and delete confirmation

### Sidebar Update
- Replaced flat "Operations > Workflows" with dedicated **Workflow Management** section:
  - Workflows (`/workflows`)
  - My Approvals (`/approvals/inbox`)
  - Submitted Requests (`/approvals/history`)
  - Delegations (`/delegations`)
- Operations section now only contains Audit Logs

### Router Update
| Route | Page |
|-------|------|
| `/workflows` | `WorkflowListPage` |
| `/workflows/builder` | `WorkflowBuilderPage` (create) |
| `/workflows/builder/:id` | `WorkflowBuilderPage` (edit) |
| `/approvals/inbox` | `ApprovalInboxPage` |
| `/approvals/history` | `ApprovalHistoryPage` |
| `/delegations` | `DelegationPage` |

### Build Output
```
npm run build → success (599ms, 0 errors, 0 warnings)
```

### APIs Connected
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/workflows` | List workflows |
| POST | `/workflows` | Create workflow |
| GET | `/workflows/:id` | Get workflow detail |
| PATCH | `/workflows/:id` | Update workflow |
| DELETE | `/workflows/:id` | Delete workflow |
| GET | `/workflows/:id/steps` | Get workflow steps |
| POST | `/workflows/:id/steps` | Save workflow steps |
| GET | `/approvals/pending` | Pending approvals for current user |
| GET | `/approvals/submitted` | Submitted approval requests |
| GET | `/approvals/:id` | Approval detail |
| GET | `/approvals/:id/timeline` | Approval step timeline |
| POST | `/approvals/:id/action` | Approve/reject action |
| GET | `/delegations` | List delegations |
| POST | `/delegations` | Create delegation |
| DELETE | `/delegations/:id` | Remove delegation |
| GET | `/users` | User list (for delegation form) |
| GET | `/departments` | Department list (for role filter) |
| GET | `/roles?departmentId=` | Role list (for step builder) |

### Feature Summary
- **Workflow Builder**: Create approval workflows with multi-step chains, each step assigned to a role with ANY/ALL approval type
- **Approval Inbox**: View pending approvals, view detail with timeline, approve/reject with mandatory comments on rejection
- **Submitted Requests**: Track all requests you've raised, see current status and full timeline
- **Delegations**: Temporarily delegate approval authority to another user with date range
- **Permission Control**: `usePermission()` guards can be applied for `VIEW_WORKFLOW`, `CREATE_WORKFLOW`, `APPROVE` actions
