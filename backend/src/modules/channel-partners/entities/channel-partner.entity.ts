import { Entity, Column } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';

@Entity('channel_partners')
export class ChannelPartner extends AppBaseEntity {
  @Column({ name: 'cp_id', unique: true, nullable: false })
  cpId: string;

  @Column({ name: 'cp_name', nullable: false })
  cpName: string;

  @Column({ name: 'cp_type_id', nullable: false })
  cpTypeId: number;

  @Column({ name: 'start_date', type: 'date', nullable: false })
  startDate: string;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
