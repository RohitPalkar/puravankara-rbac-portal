import { Entity, Column, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { ProjectLocation } from './project-location.entity';

@Entity('projects')
export class Project extends AppBaseEntity {
  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ name: 'billing_entity_name', nullable: true })
  billingEntityName: string;

  @Column({ name: 'billing_gstin', nullable: true })
  billingGstin: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'extended_metadata', type: 'jsonb', nullable: true })
  extendedMetadata: Record<string, any>;

  @OneToMany(() => ProjectLocation, (pl) => pl.project)
  locations: ProjectLocation[];
}
