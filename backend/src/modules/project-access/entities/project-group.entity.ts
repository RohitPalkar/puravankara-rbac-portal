import { Entity, Column, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { ProjectGroupProject } from './project-group-project.entity';

@Entity('project_groups')
export class ProjectGroup extends AppBaseEntity {
  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => ProjectGroupProject, (pgp) => pgp.group)
  projectGroupProjects: ProjectGroupProject[];
}
