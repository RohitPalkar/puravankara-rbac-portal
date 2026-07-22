import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { SubModule } from './sub-module.entity';
import { Action } from './action.entity';

@Entity('action_groups')
@Unique(['subModuleId', 'name'])
export class ActionGroup extends AppBaseEntity {
  @Column({ name: 'sub_module_id', nullable: false })
  subModuleId: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  code: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => SubModule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sub_module_id' })
  subModule: SubModule;

  @OneToMany(() => Action, (a) => a.actionGroup)
  actions: Action[];
}
