import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';
import { Role } from '../entities/role.entity';
import { BaseService } from '../../../common/crud/base.service';
import { DependencyValidatorService } from '../../../common/services/dependency-validator.service';
import { CreateDepartmentDto, UpdateDepartmentDto, CreateRoleDto, UpdateRoleDto } from '../dto/organization.dto';
export declare class DepartmentService extends BaseService<Department> {
    readonly repository: Repository<Department>;
    private readonly dependencyValidator;
    constructor(repository: Repository<Department>, dependencyValidator: DependencyValidatorService);
    create(dto: CreateDepartmentDto): Promise<Department>;
    update(id: number, dto: UpdateDepartmentDto): Promise<Department>;
    remove(id: number): Promise<void>;
}
export declare class RoleService extends BaseService<Role> {
    readonly repository: Repository<Role>;
    private readonly deptRepo;
    private readonly dependencyValidator;
    constructor(repository: Repository<Role>, deptRepo: Repository<Department>, dependencyValidator: DependencyValidatorService);
    create(dto: CreateRoleDto): Promise<Role>;
    update(id: number, dto: UpdateRoleDto): Promise<Role>;
    remove(id: number): Promise<void>;
}
