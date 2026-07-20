import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Department } from './department.entity';
import { Role } from './role.entity';

@Entity('department_roles')
export class DepartmentRole {
  @PrimaryColumn({ name: 'department_id' })
  departmentId: number;

  @PrimaryColumn({ name: 'role_id' })
  roleId: number;

  @ManyToOne(() => Department, { nullable: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Role, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
