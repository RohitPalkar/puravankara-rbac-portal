import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Department } from '../../organization/entities/department.entity';

@Entity('users')
export class User {
  @Column({ name: 'emp_id', primary: true, length: 20 })
  empId: string;

  @Column({ nullable: false })
  name: string;

  @Index()
  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ name: 'department_id', nullable: true })
  departmentId: number | null;

  @Column({ name: 'employment_status', default: 'PERMANENT' })
  employmentStatus: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date | null;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;

  @ManyToOne(() => Department, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department: Department;
}
