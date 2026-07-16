import { DepartmentRoleService } from '../services/department-role.service';
declare class DepartmentRoleDto {
    departmentId: number;
    roleId: number;
}
export declare class DepartmentRoleController {
    private readonly svc;
    constructor(svc: DepartmentRoleService);
    findAll(): Promise<import("../entities/department-role.entity").DepartmentRole[]>;
    create(dto: DepartmentRoleDto): Promise<import("../entities/department-role.entity").DepartmentRole>;
    remove(departmentId: string, roleId: string): Promise<{
        message: string;
    }>;
}
export {};
