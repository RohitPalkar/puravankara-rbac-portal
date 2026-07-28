import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { Zone } from '../../geography/entities/zone.entity';
import { DepartmentRole } from './department-role.entity';
import { DepartmentHierarchyLevel } from './department-hierarchy-level.entity';

@Entity('departments')
@Unique(['name', 'zoneId'])
export class Department extends AppBaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ name: 'max_hierarchy_levels', default: 4 })
  maxHierarchyLevels: number;

  @Column({ name: 'zone_id' })
  zoneId: number;

  @ManyToOne(() => Zone, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'zone_id' })
  zone: Zone;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Index()
  @Column({ name: 'department_admin_id', nullable: true })
  departmentAdminId: string | null;

  @OneToMany(() => DepartmentRole, (dr) => dr.department)
  departmentRoles: DepartmentRole[];

  @OneToMany(() => DepartmentHierarchyLevel, (hl) => hl.department)
  hierarchyLevels: DepartmentHierarchyLevel[];
}
