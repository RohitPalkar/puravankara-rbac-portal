import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { PermissionTemplate } from './permission-template.entity';
import { Module } from '../../product-catalog/entities/module.entity';
import { SubModule } from '../../product-catalog/entities/sub-module.entity';
import { Action } from '../../product-catalog/entities/action.entity';

@Entity('template_permissions')
@Unique(['templateId', 'moduleId', 'subModuleId', 'actionId'])
export class TemplatePermission extends AppBaseEntity {
  @Column({ name: 'template_id', nullable: false })
  templateId: number;

  @Column({ name: 'module_id', nullable: false })
  moduleId: number;

  @Column({ name: 'sub_module_id', nullable: true })
  subModuleId: number;

  @Column({ name: 'action_id', nullable: false })
  actionId: number;

  @ManyToOne(() => PermissionTemplate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'template_id' })
  template: PermissionTemplate;

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
