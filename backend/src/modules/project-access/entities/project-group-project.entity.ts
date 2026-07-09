import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ProjectGroup } from './project-group.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity('project_group_projects')
export class ProjectGroupProject {
  @PrimaryColumn({ name: 'group_id' })
  groupId: number;

  @PrimaryColumn({ name: 'project_id' })
  projectId: number;

  @ManyToOne(() => ProjectGroup, { nullable: false , onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: ProjectGroup;

  @ManyToOne(() => Project, { nullable: false , onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
