import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';
import { PermissionTemplate } from './permission-template.entity';

@Entity('user_permission_templates')
export class UserPermissionTemplate {
  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @PrimaryColumn({ name: 'project_id' })
  projectId: number;

  @PrimaryColumn({ name: 'template_id' })
  templateId: number;

  @Column({ name: 'assigned_by', nullable: true })
  assignedBy: string;

  @Column({ name: 'assigned_at', type: 'timestamptz', nullable: true })
  assignedAt: Date;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Project, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => PermissionTemplate, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'template_id' })
  template: PermissionTemplate;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
