import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { LaCity } from './la-city.entity';

@Entity('la_city_approvals')
export class LaCityApproval extends AppBaseEntity {
  @Index()
  @Column({ name: 'la_city_id' })
  laCityId: number;

  @ManyToOne(() => LaCity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'la_city_id' })
  city: LaCity;

  @Column({ name: 'generic_approval', type: 'varchar' })
  genericApproval: string;

  @Column({ name: 'governing_bodies', type: 'jsonb', nullable: true, default: '[]' })
  governingBodies: string[];

  @Column({ name: 'documents', type: 'jsonb', nullable: true, default: '[]' })
  documents: any[];
}
