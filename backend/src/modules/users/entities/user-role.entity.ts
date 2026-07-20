import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Department } from '../../organization/entities/department.entity';
import { Role } from '../../organization/entities/role.entity';

@Entity('user_roles')
@Unique(['userId', 'departmentId', 'roleId'])
export class UserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @Column({ name: 'department_id', nullable: true })
  departmentId: number | null;

  @Column({ name: 'role_id', nullable: false })
  roleId: number;

  @Column({ name: 'assigned_by', nullable: true })
  assignedBy: string;

  @Column({ name: 'assigned_at', type: 'timestamptz', nullable: true })
  assignedAt: Date;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department: Department | null;

  @ManyToOne(() => Role, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
