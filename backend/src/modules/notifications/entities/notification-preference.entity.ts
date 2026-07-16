import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('notification_preferences')
export class NotificationPreference extends AppBaseEntity {
  @Column({ name: 'user_id', unique: true, nullable: false })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'email_enabled', default: true })
  emailEnabled: boolean;

  @Column({ name: 'in_app_enabled', default: true })
  inAppEnabled: boolean;

  @Column({ name: 'push_enabled', default: false })
  pushEnabled: boolean;
}
