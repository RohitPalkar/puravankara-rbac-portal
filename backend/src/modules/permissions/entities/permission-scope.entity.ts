import { Entity, Column } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';

@Entity('permission_scopes')
export class PermissionScope extends AppBaseEntity {
  @Column({ unique: true, nullable: false })
  code: string;

  @Column({ nullable: true })
  label: string;
}
