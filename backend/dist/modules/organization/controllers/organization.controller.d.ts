import { DepartmentService, RoleService } from '../services/organization.service';
import { CreateDepartmentDto, UpdateDepartmentDto, CreateRoleDto, UpdateRoleDto } from '../dto/organization.dto';
import { Department } from '../entities/department.entity';
import { Role } from '../entities/role.entity';
import { BaseController } from '../../../common/crud/base.controller';
export declare class DepartmentController extends BaseController<Department, CreateDepartmentDto, UpdateDepartmentDto> {
    private readonly departmentService;
    constructor(departmentService: DepartmentService);
}
export declare class RoleController extends BaseController<Role, CreateRoleDto, UpdateRoleDto> {
    private readonly roleService;
    constructor(roleService: RoleService);
}
