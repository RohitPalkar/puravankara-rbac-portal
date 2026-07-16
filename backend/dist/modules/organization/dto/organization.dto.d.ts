export declare class CreateDepartmentDto {
    name: string;
    maxHierarchyLevels?: number;
    isActive?: boolean;
}
export declare class UpdateDepartmentDto {
    name?: string;
    maxHierarchyLevels?: number;
    isActive?: boolean;
}
export declare class CreateRoleDto {
    name: string;
    hierarchyLevelRank: number;
    isActive?: boolean;
}
export declare class UpdateRoleDto {
    name?: string;
    hierarchyLevelRank?: number;
    isActive?: boolean;
}
