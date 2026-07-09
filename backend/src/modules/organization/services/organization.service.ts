import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';
import { Role } from '../entities/role.entity';
import { BaseService } from '../../../common/crud/base.service';
import { DependencyValidatorService } from '../../../common/services/dependency-validator.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  CreateRoleDto,
  UpdateRoleDto,
} from '../dto/organization.dto';

@Injectable()
export class DepartmentService extends BaseService<Department> {
  constructor(
    @InjectRepository(Department)
    readonly repository: Repository<Department>,
    private readonly dependencyValidator: DependencyValidatorService,
  ) {
    super(repository);
  }

  async create(dto: CreateDepartmentDto): Promise<Department> {
    return super.create(dto);
  }

  async update(id: number, dto: UpdateDepartmentDto): Promise<Department> {
    return super.update(id, dto);
  }

  async remove(id: number): Promise<void> {
    await this.dependencyValidator.assertDepartmentDeletable(id);
    return super.remove(id);
  }
}

@Injectable()
export class RoleService extends BaseService<Role> {
  constructor(
    @InjectRepository(Role)
    readonly repository: Repository<Role>,
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>,
    private readonly dependencyValidator: DependencyValidatorService,
  ) {
    super(repository);
  }

  async create(dto: CreateRoleDto): Promise<Role> {
    const defaultMaxLevels = 4;
    if (dto.hierarchyLevelRank > defaultMaxLevels) {
      throw new BadRequestException(
        `Role level ${dto.hierarchyLevelRank} exceeds maximum allowed hierarchy level (${defaultMaxLevels})`,
      );
    }
    return super.create(dto);
  }

  async update(id: number, dto: UpdateRoleDto): Promise<Role> {
    if (dto.hierarchyLevelRank != null) {
      const defaultMaxLevels = 4;
      if (dto.hierarchyLevelRank > defaultMaxLevels) {
        throw new BadRequestException(
          `Role level ${dto.hierarchyLevelRank} exceeds maximum allowed hierarchy level (${defaultMaxLevels})`,
        );
      }
    }
    return super.update(id, dto);
  }

  async remove(id: number): Promise<void> {
    await this.dependencyValidator.assertRoleDeletable(id);
    return super.remove(id);
  }
}
