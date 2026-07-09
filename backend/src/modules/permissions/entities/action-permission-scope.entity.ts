import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Action } from '../../product-catalog/entities/action.entity';
import { PermissionScope } from './permission-scope.entity';

@Entity('action_permission_scopes')
export class ActionPermissionScope {
  @PrimaryColumn({ name: 'action_id' })
  actionId: number;

  @PrimaryColumn({ name: 'scope_id' })
  scopeId: number;

  @ManyToOne(() => Action, { nullable: false , onDelete: 'CASCADE' })
  @JoinColumn({ name: 'action_id' })
  action: Action;

  @ManyToOne(() => PermissionScope, { nullable: false , onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scope_id' })
  scope: PermissionScope;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
