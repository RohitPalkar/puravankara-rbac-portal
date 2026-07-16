import { Entity, Column } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';

@Entity('cities')
export class City extends AppBaseEntity {
  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
