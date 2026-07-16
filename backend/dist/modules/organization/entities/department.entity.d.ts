import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { DepartmentRole } from './department-role.entity';
export declare class Department extends AppBaseEntity {
    name: string;
    maxHierarchyLevels: number;
    isActive: boolean;
    departmentRoles: DepartmentRole[];
}
