import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { LaCity } from './la-city.entity';
import { LaMicromarket } from './la-micromarket.entity';

@Entity('la_regions')
export class LaRegion extends AppBaseEntity {
  @Index()
  @Column({ name: 'la_city_id' })
  laCityId: number;

  @ManyToOne(() => LaCity, (c) => c.regions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'la_city_id' })
  city: LaCity;

  @Column({ name: 'region_name' })
  regionName: string;

  @OneToMany(() => LaMicromarket, (m) => m.region)
  micromarkets: LaMicromarket[];
}
