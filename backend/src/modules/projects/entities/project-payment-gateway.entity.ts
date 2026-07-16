import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { Project } from './project.entity';

export enum PaymentGatewayType {
  RAZORPAY = 'razorpay',
  EASEBUZZ_BOOKING = 'easebuzz_booking',
  EASEBUZZ_MILESTONE = 'easebuzz_milestone',
}

@Entity('project_payment_gateways')
export class ProjectPaymentGateway extends AppBaseEntity {
  @Column({ name: 'project_id', nullable: false })
  projectId: number;

  @ManyToOne(() => Project, (p) => p.paymentGateways, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({
    name: 'gateway_type',
    type: 'enum',
    enum: PaymentGatewayType,
    nullable: false,
  })
  gatewayType: PaymentGatewayType;

  @Column({ name: 'merchant_id', nullable: true })
  merchantId: string;

  @Column({ name: 'secret_key', nullable: true })
  secretKey: string;

  @Column({ name: 'salt', nullable: true })
  salt: string;

  @Column({ name: 'key', nullable: true })
  key: string;

  @Column({ name: 'sub_merchant_id', nullable: true })
  subMerchantId: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
