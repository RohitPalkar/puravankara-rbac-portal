import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { DepartmentRole } from './department-role.entity';
import { DepartmentHierarchyLevel } from './department-hierarchy-level.entity';
import { DepartmentZoneMapping } from './department-zone-mapping.entity';

@Entity('departments')
export class Department extends AppBaseEntity {
  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ name: 'max_hierarchy_levels', default: 4 })
  maxHierarchyLevels: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Index()
  @Column({ name: 'department_admin_id', nullable: true })
  departmentAdminId: string | null;

  @OneToMany(() => DepartmentRole, (dr) => dr.department)
  departmentRoles: DepartmentRole[];

  @OneToMany(() => DepartmentHierarchyLevel, (hl) => hl.department)
  hierarchyLevels: DepartmentHierarchyLevel[];

  @OneToMany(() => DepartmentZoneMapping, (zm) => zm.department)
  zoneMappings: DepartmentZoneMapping[];
}
