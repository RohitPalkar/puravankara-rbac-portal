import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { PermissionProfileModule } from './permission-profile-module.entity';
import { SubModule } from '../../product-catalog/entities/sub-module.entity';
import { PermissionProfileProject } from './permission-profile-project.entity';

@Entity('permission_profile_sub_modules')
export class PermissionProfileSubModule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'profile_module_id', nullable: false })
  profileModuleId: number;

  @Column({ name: 'sub_module_id', nullable: false })
  subModuleId: number;

  @Column({ name: 'parent_submodule_id', nullable: true })
  parentSubModuleId: number | null;

  @Column({ name: 'inherit_future_projects', default: false })
  inheritFutureProjects: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => PermissionProfileModule, (ppm) => ppm.subModules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_module_id' })
  profileModule: PermissionProfileModule;

  @ManyToOne(() => SubModule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sub_module_id' })
  subModule: SubModule;

  @OneToMany(() => PermissionProfileProject, (ppp) => ppp.profileSubModule, { cascade: true })
  projects: PermissionProfileProject[];
}
