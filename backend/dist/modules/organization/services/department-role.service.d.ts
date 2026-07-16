import { Repository } from 'typeorm';
import { DepartmentRole } from '../entities/department-role.entity';
export declare class DepartmentRoleService {
    readonly repository: Repository<DepartmentRole>;
    constructor(repository: Repository<DepartmentRole>);
    findAll(): Promise<DepartmentRole[]>;
    create(dto: {
        departmentId: number;
        roleId: number;
    }): Promise<DepartmentRole>;
    remove(departmentId: number, roleId: number): Promise<void>;
}
