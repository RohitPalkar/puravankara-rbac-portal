import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { Department } from './department.entity';
import { Zone } from '../../geography/entities/zone.entity';

@Entity('department_zone_mappings')
@Unique(['departmentId', 'zoneId'])
export class DepartmentZoneMapping {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'department_id' })
  departmentId: number;

  @Column({ name: 'zone_id' })
  zoneId: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Department, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Zone, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'zone_id' })
  zone: Zone;
}
