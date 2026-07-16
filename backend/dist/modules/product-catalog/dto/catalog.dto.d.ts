export declare class CreateModuleDto {
    name: string;
    isActive?: boolean;
}
export declare class UpdateModuleDto {
    name?: string;
    isActive?: boolean;
}
export declare class CreateSubModuleDto {
    moduleId: number;
    name: string;
    isActive?: boolean;
}
export declare class UpdateSubModuleDto {
    moduleId?: number;
    name?: string;
    isActive?: boolean;
}
export declare class CreateActionDto {
    code: string;
    label: string;
    isActive?: boolean;
}
export declare class UpdateActionDto {
    code?: string;
    label?: string;
    isActive?: boolean;
}
export declare class CreateModuleActionDto {
    moduleId: number;
    subModuleId?: number;
    actionId: number;
    isActive?: boolean;
}
export declare class UpdateModuleActionDto {
    moduleId?: number;
    subModuleId?: number;
    actionId?: number;
    isActive?: boolean;
}
