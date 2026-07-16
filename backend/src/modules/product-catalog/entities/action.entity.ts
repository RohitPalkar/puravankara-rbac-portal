import { Entity, Column } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';

@Entity('actions')
export class Action extends AppBaseEntity {
  @Column({ unique: true, nullable: false })
  code: string;

  @Column({ nullable: false })
  label: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
