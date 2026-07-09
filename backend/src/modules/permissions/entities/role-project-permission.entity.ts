import { Entity, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { Role } from '../../organization/entities/role.entity';
import { Project } from '../../projects/entities/project.entity';
import { Module } from '../../product-catalog/entities/module.entity';
import { SubModule } from '../../product-catalog/entities/sub-module.entity';
import { Action } from '../../product-catalog/entities/action.entity';

@Entity('role_project_permissions')
@Unique(['roleId', 'projectId', 'moduleId', 'subModuleId', 'actionId'])
@Index(['roleId', 'projectId'])
export class RoleProjectPermission extends AppBaseEntity {
  @Column({ name: 'role_id', nullable: false })
  roleId: number;

  @Column({ name: 'project_id', nullable: false })
  projectId: number;

  @Column({ name: 'module_id', nullable: false })
  moduleId: number;

  @Column({ name: 'sub_module_id', nullable: true })
  subModuleId: number;

  @Column({ name: 'action_id', nullable: false })
  actionId: number;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

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
