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

@Entity('user_project_access')
export class UserProjectAccess {
  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @PrimaryColumn({ name: 'project_id' })
  projectId: number;

  @Column({ name: 'assigned_by', nullable: true })
  assignedBy: string;

  @Column({ name: 'assigned_at', type: 'timestamptz', nullable: true })
  assignedAt: Date;

  @ManyToOne(() => User, { nullable: false , onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Project, { nullable: false , onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
