import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { PermissionProfile } from './permission-profile.entity';
import { Module } from '../../product-catalog/entities/module.entity';
import { PermissionProfileSubModule } from './permission-profile-sub-module.entity';

@Entity('permission_profile_modules')
export class PermissionProfileModule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'profile_id', nullable: false })
  profileId: number;

  @Column({ name: 'module_id', nullable: false })
  moduleId: number;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => PermissionProfile, (pp) => pp.modules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile: PermissionProfile;

  @ManyToOne(() => Module, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @OneToMany(() => PermissionProfileSubModule, (ppsm) => ppsm.profileModule, { cascade: true })
  subModules: PermissionProfileSubModule[];
}
