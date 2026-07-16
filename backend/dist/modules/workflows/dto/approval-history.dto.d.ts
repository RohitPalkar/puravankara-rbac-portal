export declare class ApprovalStepResponse {
    id: number;
    stepOrder: number;
    approverId: string;
    status: string;
    comments?: string;
    actionDate?: Date;
}
export declare class ApprovalHistoryResponse {
    id: number;
    workflowId: number;
    projectId?: number;
    entityType?: string;
    entityId?: string;
    requestedBy: string;
    status: string;
    currentStep?: number;
    completedAt?: Date;
    steps: ApprovalStepResponse[];
}
