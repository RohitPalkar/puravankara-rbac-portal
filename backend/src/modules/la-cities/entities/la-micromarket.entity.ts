import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { LaRegion } from './la-region.entity';
import { LaLocality } from './la-locality.entity';

@Entity('la_micromarkets')
export class LaMicromarket extends AppBaseEntity {
  @Index()
  @Column({ name: 'la_region_id' })
  laRegionId: number;

  @ManyToOne(() => LaRegion, (r) => r.micromarkets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'la_region_id' })
  region: LaRegion;

  @Column({ name: 'micromarket_name' })
  micromarketName: string;

  @OneToMany(() => LaLocality, (l) => l.micromarket)
  localities: LaLocality[];
}
