import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { ApprovalWorkflow } from './approval-workflow.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity('approval_requests')
export class ApprovalRequest extends AppBaseEntity {
  @Column({ name: 'workflow_id', nullable: false })
  workflowId: number;

  @Column({ name: 'project_id', nullable: true })
  projectId: number;

  @Column({ name: 'entity_type', nullable: true })
  entityType: string;

  @Column({ name: 'entity_id', nullable: true })
  entityId: string;

  @Column({ name: 'requested_by', nullable: false })
  requestedBy: string;

  @Column({ name: 'current_step', nullable: true })
  currentStep: number;

  @Column({ length: 20, default: 'PENDING' })
  status: string;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date;

  @ManyToOne(() => ApprovalWorkflow, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflow_id' })
  workflow: ApprovalWorkflow;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;
}
