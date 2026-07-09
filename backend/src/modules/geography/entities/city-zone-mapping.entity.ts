import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { City } from './city.entity';
import { Zone } from './zone.entity';

@Entity('city_zone_mappings')
export class CityZoneMapping {
  @PrimaryColumn({ name: 'city_id' })
  cityId: number;

  @PrimaryColumn({ name: 'zone_id' })
  zoneId: number;

  @ManyToOne(() => City, { nullable: false , onDelete: 'CASCADE' })
  @JoinColumn({ name: 'city_id' })
  city: City;

  @ManyToOne(() => Zone, { nullable: false , onDelete: 'CASCADE' })
  @JoinColumn({ name: 'zone_id' })
  zone: Zone;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
