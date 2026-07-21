import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { Department } from './department.entity';

@Entity('department_hierarchy_levels')
@Index(['departmentId', 'levelNumber'], { unique: true })
export class DepartmentHierarchyLevel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'department_id' })
  departmentId: number;

  @Column({ name: 'level_number' })
  levelNumber: number;

  @Column({ name: 'role_name' })
  roleName: string;

  @Column({ name: 'display_order' })
  displayOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Department, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'department_id' })
  department: Department;
}
