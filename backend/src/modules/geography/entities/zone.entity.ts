import { Entity, Column } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';

@Entity('zones')
export class Zone extends AppBaseEntity {
  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
