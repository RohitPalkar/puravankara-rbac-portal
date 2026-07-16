export declare class CreateWorkflowStepDto {
    stepOrder: number;
    roleId: number;
    approvalType: string;
    departmentId?: number;
    levelRank?: number;
    isMandatory?: boolean;
}
export declare class CreateWorkflowDto {
    name: string;
    moduleId: number;
    subModuleId?: number;
    actionId: number;
    steps: CreateWorkflowStepDto[];
}
