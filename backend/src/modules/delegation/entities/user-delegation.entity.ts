import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { User } from '../../users/entities/user.entity';
import { Module } from '../../product-catalog/entities/module.entity';

@Entity('user_delegations')
export class UserDelegation extends AppBaseEntity {
  @Column({ name: 'from_user_id', nullable: false })
  fromUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'from_user_id' })
  fromUser: User;

  @Column({ name: 'to_user_id', nullable: false })
  toUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'to_user_id' })
  toUser: User;

  @Column({ name: 'module_id', nullable: true })
  moduleId: number;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  reason: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => Module, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: Module;
}
