import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { ApprovalWorkflow } from './approval-workflow.entity';
import { Department } from '../../organization/entities/department.entity';
import { Role } from '../../organization/entities/role.entity';

@Entity('approval_steps')
@Unique(['workflowId', 'stepOrder'])
export class ApprovalStep extends AppBaseEntity {
  @Column({ name: 'workflow_id', nullable: false })
  workflowId: number;

  @Column({ name: 'step_order', nullable: false })
  stepOrder: number;

  @Column({ name: 'department_id', nullable: true })
  departmentId: number | null;

  @Column({ name: 'role_id', nullable: false })
  roleId: number;

  @Column({ name: 'level_rank', nullable: true })
  levelRank: number | null;

  @Column({ name: 'approval_type', length: 20, nullable: false })
  approvalType: string;

  @Column({ name: 'is_mandatory', default: true })
  isMandatory: boolean;

  @ManyToOne(() => ApprovalWorkflow, { nullable: false , onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflow_id' })
  workflow: ApprovalWorkflow;

  @ManyToOne(() => Department, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
