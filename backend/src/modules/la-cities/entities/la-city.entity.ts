import { Entity, Column, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { Zone } from '../../geography/entities/zone.entity';
import { LaRegion } from './la-region.entity';

@Entity('la_cities')
export class LaCity extends AppBaseEntity {
  @Column({ name: 'city_name' })
  cityName: string;

  @Index()
  @Column({ name: 'business_zone_id' })
  businessZoneId: number;

  @ManyToOne(() => Zone, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'business_zone_id' })
  businessZone: Zone;

  @OneToMany(() => LaRegion, (r) => r.city)
  regions: LaRegion[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
