import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { Project } from './project.entity';

export enum IncentiveType {
  RERA = 'rera',
  RTM = 'rtm',
}

@Entity('project_incentive_rules')
export class ProjectIncentiveRule extends AppBaseEntity {
  @Column({ name: 'project_id', nullable: false })
  projectId: number;

  @ManyToOne(() => Project, (p) => p.incentiveRules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({
    name: 'incentive_type',
    type: 'enum',
    enum: IncentiveType,
    nullable: false,
  })
  incentiveType: IncentiveType;

  @Column({
    name: 'regularization_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  regularizationPercentage: number;

  @Column({
    name: 'payable_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  payablePercentage: number;

  @Column({ name: 'max_days', type: 'int', nullable: true })
  maxDays: number;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: string;
}
