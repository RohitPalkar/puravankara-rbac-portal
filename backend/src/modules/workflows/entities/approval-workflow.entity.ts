import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { Module } from '../../product-catalog/entities/module.entity';
import { SubModule } from '../../product-catalog/entities/sub-module.entity';
import { Action } from '../../product-catalog/entities/action.entity';

@Entity('approval_workflows')
@Unique(['name'])
export class ApprovalWorkflow extends AppBaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ name: 'module_id', nullable: false })
  moduleId: number;

  @Column({ name: 'sub_module_id', nullable: true })
  subModuleId: number;

  @Column({ name: 'action_id', nullable: false })
  actionId: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => Module, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @ManyToOne(() => SubModule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sub_module_id' })
  subModule: SubModule;

  @ManyToOne(() => Action, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'action_id' })
  action: Action;
}
