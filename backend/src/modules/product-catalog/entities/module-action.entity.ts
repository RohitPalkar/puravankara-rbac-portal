import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { Module } from './module.entity';
import { SubModule } from './sub-module.entity';
import { Action } from './action.entity';

@Entity('module_actions')
@Unique(['moduleId', 'subModuleId', 'actionId'])
export class ModuleAction extends AppBaseEntity {
  @Column({ name: 'module_id', nullable: false })
  moduleId: number;

  @Column({ name: 'sub_module_id', nullable: true })
  subModuleId: number;

  @Column({ name: 'action_id', nullable: false })
  actionId: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => Module, (m) => m.moduleActions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @ManyToOne(() => SubModule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sub_module_id' })
  subModule: SubModule;

  @ManyToOne(() => Action, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'action_id' })
  action: Action;
}
