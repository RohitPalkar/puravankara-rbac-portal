import { Entity, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { Role } from '../../organization/entities/role.entity';
import { Zone } from '../../geography/entities/zone.entity';
import { Department } from '../../organization/entities/department.entity';
import { Module } from '../../product-catalog/entities/module.entity';
import { SubModule } from '../../product-catalog/entities/sub-module.entity';
import { ActionGroup } from '../../product-catalog/entities/action-group.entity';
import { Action } from '../../product-catalog/entities/action.entity';

@Entity('role_action_permissions')
@Unique(['zoneId', 'departmentId', 'roleId', 'actionId'])
@Index(['roleId'])
export class RoleActionPermission extends AppBaseEntity {
  @Column({ name: 'zone_id', nullable: true })
  zoneId: number;

  @Column({ name: 'department_id', nullable: true })
  departmentId: number;

  @Column({ name: 'role_id', nullable: false })
  roleId: number;

  @Column({ name: 'module_id', nullable: false })
  moduleId: number;

  @Column({ name: 'sub_module_id', nullable: true })
  subModuleId: number;

  @Column({ name: 'action_group_id', nullable: true })
  actionGroupId: number;

  @Column({ name: 'action_id', nullable: false })
  actionId: number;

  @ManyToOne(() => Zone, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'zone_id' })
  zone: Zone;

  @ManyToOne(() => Department, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Module, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @ManyToOne(() => SubModule, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sub_module_id' })
  subModule: SubModule;

  @ManyToOne(() => ActionGroup, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'action_group_id' })
  actionGroup: ActionGroup;

  @ManyToOne(() => Action, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'action_id' })
  action: Action;
}
