export declare class ExplainPermissionDto {
    userId: string;
    projectId: number;
    module: string;
    action: string;
}
export declare class ExplainStep {
    step: string;
    result: boolean;
    message: string;
}
export declare class ExplainPermissionResponse {
    allowed: boolean;
    source: string;
    explanation: ExplainStep[];
}
