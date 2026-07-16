import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity('user_project_feature_matrix')
@Unique(['userId', 'projectId'])
export class UserProjectFeatureMatrix {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @Column({ name: 'project_id', nullable: false })
  projectId: number;

  @Column({ name: 'feature_privileges_document', type: 'jsonb', nullable: true })
  featurePrivilegesDocument: Record<string, any>;

  @CreateDateColumn({ name: 'generated_at', type: 'timestamptz' })
  generatedAt: Date;

  @Column({ name: 'version', default: 1 })
  version: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Project, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;
}
