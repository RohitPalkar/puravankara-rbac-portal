import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../../organization/entities/department.entity';
import { Role } from '../../organization/entities/role.entity';
import { Module as ProductModule } from '../../product-catalog/entities/module.entity';
import { SubModule } from '../../product-catalog/entities/sub-module.entity';
import { Project } from '../../projects/entities/project.entity';
import { Zone } from '../../geography/entities/zone.entity';

@Injectable()
export class UserMetadataService {
  constructor(
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(ProductModule)
    private readonly moduleRepo: Repository<ProductModule>,
    @InjectRepository(SubModule)
    private readonly subModuleRepo: Repository<SubModule>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Zone)
    private readonly zoneRepo: Repository<Zone>,
  ) {}

  async getMetadata() {
    const [departments, roles, modules, subModules, projects, zones] =
      await Promise.all([
        this.deptRepo.find({ where: { isActive: true }, order: { name: 'ASC' } }),
        this.roleRepo.find({ where: { isActive: true }, order: { name: 'ASC' } }),
        this.moduleRepo.find({ where: { isActive: true }, order: { name: 'ASC' } }),
        this.subModuleRepo.find({ where: { isActive: true }, order: { name: 'ASC' } }),
        this.projectRepo.find({ order: { name: 'ASC' } }),
        this.zoneRepo.find({ where: { isActive: true }, order: { name: 'ASC' } }),
      ]);

    return {
      departments,
      roles,
      modules,
      subModules,
      projects,
      zones,
    };
  }
}
