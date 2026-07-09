import { Entity, Column, Unique } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';

@Entity('roles')
@Unique(['name'])
export class Role extends AppBaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ name: 'hierarchy_level_rank', nullable: false })
  hierarchyLevelRank: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_system_role', default: false })
  isSystemRole: boolean;
}
