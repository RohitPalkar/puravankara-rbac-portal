import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
@Index(['userId', 'isRead'])
export class Notification extends AppBaseEntity {
  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ name: 'notification_type', nullable: true })
  notificationType: string;

  @Column({ nullable: true })
  priority: string;

  @Column({ name: 'reference_type', nullable: true })
  referenceType: string;

  @Column({ name: 'reference_id', nullable: true })
  referenceId: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt: Date;
}
