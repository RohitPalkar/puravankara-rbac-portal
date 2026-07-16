import { Department } from './department.entity';
import { Role } from './role.entity';
export declare class DepartmentRole {
    departmentId: number;
    roleId: number;
    department: Department;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
}
