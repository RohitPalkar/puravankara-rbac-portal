import { Entity, Column, ManyToOne, JoinColumn, Unique, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { Module } from './module.entity';
import { ActionGroup } from './action-group.entity';

@Entity('sub_modules')
@Unique(['moduleId', 'name'])
export class SubModule extends AppBaseEntity {
  @Column({ name: 'module_id', nullable: false })
  moduleId: number;

  @Column({ nullable: false })
  name: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_permission_configurable', default: true })
  isPermissionConfigurable: boolean;

  @ManyToOne(() => Module, (m) => m.subModules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @OneToMany(() => ActionGroup, (ag) => ag.subModule)
  actionGroups: ActionGroup[];
}
