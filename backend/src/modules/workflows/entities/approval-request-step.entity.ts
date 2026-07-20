import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { ApprovalRequest } from './approval-request.entity';

@Entity('approval_request_steps')
export class ApprovalRequestStep extends AppBaseEntity {
  @Column({ name: 'request_id', nullable: false })
  requestId: number;

  @Column({ name: 'step_order', nullable: true })
  stepOrder: number;

  @Column({ name: 'approver_id', nullable: false })
  approverId: string;

  @Column({ length: 20, default: 'PENDING' })
  status: string;

  @Column({ nullable: true })
  comments: string;

  @Column({ name: 'action_date', type: 'timestamptz', nullable: true })
  actionDate: Date;

  @ManyToOne(() => ApprovalRequest, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request: ApprovalRequest;
}
