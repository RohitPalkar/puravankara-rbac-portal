export interface WorkflowContext {
    userId: string;
    workflowId: number;
    projectId?: number;
    entityType?: string;
    entityId?: string;
}
