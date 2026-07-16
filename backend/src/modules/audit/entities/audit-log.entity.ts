import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';

@Entity('audit_logs')
export class AuditLog extends AppBaseEntity {
  @Column({ name: 'entity_name', nullable: true })
  entityName: string;

  @Column({ name: 'entity_id', nullable: true })
  entityId: string;

  @Column({ nullable: true })
  action: string;

  @Column({ name: 'old_value', type: 'json', nullable: true })
  oldValue: Record<string, any>;

  @Column({ name: 'new_value', type: 'json', nullable: true })
  newValue: Record<string, any>;

  @Column({ name: 'performed_by', nullable: true })
  performedBy: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ name: 'request_id', nullable: true })
  requestId: string;

  @Column({ nullable: true })
  source: string;
}
