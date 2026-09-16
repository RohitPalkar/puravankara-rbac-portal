import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { LaMicromarket } from './la-micromarket.entity';

@Entity('la_localities')
export class LaLocality extends AppBaseEntity {
  @Index()
  @Column({ name: 'la_micromarket_id' })
  laMicromarketId: number;

  @ManyToOne(() => LaMicromarket, (m) => m.localities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'la_micromarket_id' })
  micromarket: LaMicromarket;

  @Column({ name: 'locality_name' })
  localityName: string;

  @Column({ name: 'pincode', length: 6 })
  pincode: string;
}
