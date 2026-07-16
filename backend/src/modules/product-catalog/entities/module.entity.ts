import { Entity, Column, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { SubModule } from './sub-module.entity';
import { ModuleAction } from './module-action.entity';

@Entity('modules')
export class Module extends AppBaseEntity {
  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ nullable: true })
  code: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => SubModule, (sm) => sm.module)
  subModules: SubModule[];

  @OneToMany(() => ModuleAction, (ma) => ma.module)
  moduleActions: ModuleAction[];
}
