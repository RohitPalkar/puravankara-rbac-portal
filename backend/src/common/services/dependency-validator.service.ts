import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { UserRole } from '../../modules/users/entities/user-role.entity';
import { RoleProjectPermission } from '../../modules/permissions/entities/role-project-permission.entity';
import { TemplatePermission } from '../../modules/permissions/entities/template-permission.entity';
import { ModuleAction } from '../../modules/product-catalog/entities/module-action.entity';
import { DepartmentRole } from '../../modules/organization/entities/department-role.entity';

@Injectable()
export class DependencyValidatorService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
    @InjectRepository(RoleProjectPermission)
    private readonly rppRepo: Repository<RoleProjectPermission>,
    @InjectRepository(TemplatePermission)
    private readonly tpRepo: Repository<TemplatePermission>,
    @InjectRepository(ModuleAction)
    private readonly moduleActionRepo: Repository<ModuleAction>,
    @InjectRepository(DepartmentRole)
    private readonly deptRoleRepo: Repository<DepartmentRole>,
  ) {}

  async assertDepartmentDeletable(departmentId: number): Promise<void> {
    const userCount = await this.userRepo.count({
      where: { departmentId, deletedAt: null },
    });
    if (userCount > 0) {
      throw new ConflictException(
        `This department is assigned to ${userCount} user(s). Remove the assignments first.`,
      );
    }
    const deptRoleCount = await this.deptRoleRepo.count({
      where: { departmentId },
    });
    if (deptRoleCount > 0) {
      throw new ConflictException(
        `This department has ${deptRoleCount} role mapping(s). Remove the mappings first.`,
      );
    }
  }

  async assertRoleDeletable(roleId: number): Promise<void> {
    const userCount = await this.userRoleRepo.count({
      where: { roleId },
    });
    if (userCount > 0) {
      throw new ConflictException(
        `This role is assigned to ${userCount} user(s). Remove the assignments first.`,
      );
    }
    const permCount = await this.rppRepo.count({
      where: { roleId },
    });
    if (permCount > 0) {
      throw new ConflictException(
        `This role has ${permCount} permission mapping(s). Remove the mappings first.`,
      );
    }
  }

  async assertModuleDeletable(moduleId: number): Promise<void> {
    const rppCount = await this.rppRepo.count({
      where: { moduleId },
    });
    if (rppCount > 0) {
      throw new ConflictException(
        `This module has ${rppCount} role permission mapping(s). Remove the mappings first.`,
      );
    }
    const tpCount = await this.tpRepo.count({
      where: { moduleId },
    });
    if (tpCount > 0) {
      throw new ConflictException(
        `This module has ${tpCount} template permission mapping(s). Remove the mappings first.`,
      );
    }
    const maCount = await this.moduleActionRepo.count({
      where: { moduleId },
    });
    if (maCount > 0) {
      throw new ConflictException(
        `This module has ${maCount} module-action mapping(s). Remove the mappings first.`,
      );
    }
  }
}
