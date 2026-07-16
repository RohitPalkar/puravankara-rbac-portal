export declare class AssignProjectAccessDto {
    userId: string;
    projectId: number;
}
export declare class AssignBulkProjectAccessDto {
    userId: string;
    projectIds: number[];
}
export declare class CreateProjectGroupDto {
    name: string;
    description?: string;
    isActive?: boolean;
}
export declare class UpdateProjectGroupDto {
    name?: string;
    description?: string;
    isActive?: boolean;
}
export declare class AddProjectToGroupDto {
    groupId: number;
    projectId: number;
}
export declare class AssignUserProjectGroupDto {
    userId: string;
    groupId: number;
}
