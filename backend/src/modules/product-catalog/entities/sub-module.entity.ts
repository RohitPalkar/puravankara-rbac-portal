import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { Module } from './module.entity';

@Entity('sub_modules')
@Unique(['moduleId', 'name'])
export class SubModule extends AppBaseEntity {
  @Column({ name: 'module_id', nullable: false })
  moduleId: number;

  @Column({ nullable: false })
  name: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => Module, (m) => m.subModules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: Module;
}
