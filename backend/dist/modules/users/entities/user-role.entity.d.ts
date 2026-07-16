import { User } from './user.entity';
import { Department } from '../../organization/entities/department.entity';
import { Role } from '../../organization/entities/role.entity';
export declare class UserRole {
    id: number;
    userId: string;
    departmentId: number | null;
    roleId: number;
    assignedBy: string;
    assignedAt: Date;
    user: User;
    department: Department | null;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
}
