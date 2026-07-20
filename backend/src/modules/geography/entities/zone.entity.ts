import { Entity, Column } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';

@Entity('zones')
export class Zone extends AppBaseEntity {
  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({
    name: 'salary_capping',
    type: 'decimal',
    precision: 4,
    scale: 2,
    default: 1.0,
  })
  salaryCapping: number;

  @Column({
    name: 'effective_date',
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  effectiveDate: Date;
}
