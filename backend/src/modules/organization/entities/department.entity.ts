import { Entity, Column, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { DepartmentRole } from './department-role.entity';

@Entity('departments')
export class Department extends AppBaseEntity {
  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ name: 'max_hierarchy_levels', default: 4 })
  maxHierarchyLevels: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => DepartmentRole, (dr) => dr.department)
  departmentRoles: DepartmentRole[];
}
