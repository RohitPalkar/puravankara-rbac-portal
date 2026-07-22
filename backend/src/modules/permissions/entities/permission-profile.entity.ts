import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Department } from '../../organization/entities/department.entity';
import { Role } from '../../organization/entities/role.entity';
import { PermissionProfileModule } from './permission-profile-module.entity';

@Entity('permission_profiles')
export class PermissionProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @Column({ name: 'profile_type', type: 'varchar', length: 20, nullable: false })
  profileType: string;

  @Column({ name: 'department_id', nullable: true })
  departmentId: number | null;

  @Column({ name: 'role_id', nullable: true })
  roleId: number | null;

  @Column({ name: 'buddy_user_id', nullable: true })
  buddyUserId: string | null;

  @Column({ name: 'display_name', nullable: true })
  displayName: string | null;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Department, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department: Department | null;

  @ManyToOne(() => Role, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'role_id' })
  role: Role | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'buddy_user_id' })
  buddyUser: User | null;

  @OneToMany(() => PermissionProfileModule, (ppm) => ppm.profile, { cascade: true })
  modules: PermissionProfileModule[];
}
