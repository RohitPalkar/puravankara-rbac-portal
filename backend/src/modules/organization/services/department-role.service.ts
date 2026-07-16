import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartmentRole } from '../entities/department-role.entity';

@Injectable()
export class DepartmentRoleService {
  constructor(
    @InjectRepository(DepartmentRole)
    readonly repository: Repository<DepartmentRole>,
  ) {}

  async findAll(): Promise<DepartmentRole[]> {
    return this.repository.find({
      relations: { department: true, role: true },
    });
  }

  async create(dto: {
    departmentId: number;
    roleId: number;
  }): Promise<DepartmentRole> {
    const existing = await this.repository.findOne({
      where: { departmentId: dto.departmentId, roleId: dto.roleId },
    });
    if (existing)
      throw new ConflictException('Department-role mapping already exists');
    const dr = this.repository.create(dto);
    return this.repository.save(dr);
  }

  async remove(departmentId: number, roleId: number): Promise<void> {
    const result = await this.repository.delete({ departmentId, roleId });
    if (result.affected === 0)
      throw new NotFoundException('Department-role mapping not found');
  }
}
