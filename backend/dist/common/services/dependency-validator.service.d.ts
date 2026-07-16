import { Repository } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { UserRole } from '../../modules/users/entities/user-role.entity';
import { RoleProjectPermission } from '../../modules/permissions/entities/role-project-permission.entity';
import { TemplatePermission } from '../../modules/permissions/entities/template-permission.entity';
import { ModuleAction } from '../../modules/product-catalog/entities/module-action.entity';
import { DepartmentRole } from '../../modules/organization/entities/department-role.entity';
export declare class DependencyValidatorService {
    private readonly userRepo;
    private readonly userRoleRepo;
    private readonly rppRepo;
    private readonly tpRepo;
    private readonly moduleActionRepo;
    private readonly deptRoleRepo;
    constructor(userRepo: Repository<User>, userRoleRepo: Repository<UserRole>, rppRepo: Repository<RoleProjectPermission>, tpRepo: Repository<TemplatePermission>, moduleActionRepo: Repository<ModuleAction>, deptRoleRepo: Repository<DepartmentRole>);
    assertDepartmentDeletable(departmentId: number): Promise<void>;
    assertRoleDeletable(roleId: number): Promise<void>;
    assertModuleDeletable(moduleId: number): Promise<void>;
}
