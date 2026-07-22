import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { PermissionProfileSubModule } from './permission-profile-sub-module.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity('permission_profile_projects')
export class PermissionProfileProject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'profile_sub_module_id', nullable: false })
  profileSubModuleId: number;

  @Column({ name: 'project_id', nullable: false })
  projectId: number;

  @Column({ name: 'selected_by', nullable: true })
  selectedBy: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => PermissionProfileSubModule, (ppsm) => ppsm.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_sub_module_id' })
  profileSubModule: PermissionProfileSubModule;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;
}
