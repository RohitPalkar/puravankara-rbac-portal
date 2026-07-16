import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from './project.entity';
import { City } from '../../geography/entities/city.entity';
import { Zone } from '../../geography/entities/zone.entity';

@Entity('project_locations')
export class ProjectLocation {
  @PrimaryColumn({ name: 'project_id' })
  projectId: number;

  @PrimaryColumn({ name: 'city_id' })
  cityId: number;

  @PrimaryColumn({ name: 'zone_id' })
  zoneId: number;

  @ManyToOne(() => Project, { nullable: false , onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

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
