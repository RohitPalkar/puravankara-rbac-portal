import { Department } from '../../organization/entities/department.entity';
export declare class User {
    empId: string;
    name: string;
    email: string;
    departmentId: number | null;
    employmentStatus: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    createdBy: string;
    updatedBy: string;
    department: Department;
}
