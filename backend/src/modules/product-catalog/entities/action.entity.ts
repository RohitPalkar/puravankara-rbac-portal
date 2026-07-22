import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { ActionGroup } from './action-group.entity';

@Entity('actions')
export class Action extends AppBaseEntity {
  @Column({ name: 'action_group_id', nullable: true })
  actionGroupId: number;

  @Column({ unique: true, nullable: false })
  code: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  label: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => ActionGroup, (ag) => ag.actions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'action_group_id' })
  actionGroup: ActionGroup;
}
