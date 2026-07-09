import { Entity, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';
import { Module } from '../../product-catalog/entities/module.entity';
import { SubModule } from '../../product-catalog/entities/sub-module.entity';
import { Action } from '../../product-catalog/entities/action.entity';
import { PermissionType } from '../../../common/enums';

@Entity('user_permission_overrides')
@Unique(['userId', 'projectId', 'moduleId', 'subModuleId', 'actionId'])
export class UserPermissionOverride extends AppBaseEntity {
  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @Column({ name: 'project_id', nullable: false })
  projectId: number;

  @Column({ name: 'module_id', nullable: false })
  moduleId: number;

  @Column({ name: 'sub_module_id', nullable: true })
  subModuleId: number;

  @Column({ name: 'action_id', nullable: false })
  actionId: number;

  @Column({
    name: 'permission_type',
    type: 'varchar',
    length: 10,
    nullable: false,
  })
  permissionType: PermissionType;

  @Column({ nullable: true })
  reason: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

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
