import { Entity, Column } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';

@Entity('brands')
export class Brand extends AppBaseEntity {
  @Column({ name: 'brand_name', unique: true, nullable: false })
  brandName: string;

  @Column({
    name: 'salary_multiplier',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  salaryMultiplier: number;

  @Column({ name: 'razorpay_merchant_id', nullable: true })
  razorpayMerchantId: string;

  @Column({ name: 'razorpay_secret_key', nullable: true })
  razorpaySecretKey: string;

  @Column({ name: 'easebuzz_booking_salt', nullable: true })
  easebuzzBookingSalt: string;

  @Column({ name: 'easebuzz_booking_key', nullable: true })
  easebuzzBookingKey: string;

  @Column({ name: 'easebuzz_booking_sub_merchant_id', nullable: true })
  easebuzzBookingSubMerchantId: string;

  @Column({ name: 'easebuzz_milestone_salt', nullable: true })
  easebuzzMilestoneSalt: string;

  @Column({ name: 'easebuzz_milestone_key', nullable: true })
  easebuzzMilestoneKey: string;

  @Column({ name: 'easebuzz_milestone_sub_merchant_id', nullable: true })
  easebuzzMilestoneSubMerchantId: string;

  @Column({ name: 'billing_name', nullable: true })
  billingName: string;

  @Column({ name: 'pan_number', nullable: true })
  panNumber: string;

  @Column({ name: 'gstin', nullable: true })
  gstin: string;

  @Column({ name: 'address_1', nullable: true })
  address1: string;

  @Column({ name: 'address_2', nullable: true })
  address2: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ name: 'pin_code', nullable: true })
  pinCode: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  @Column({
    name: 'rera_regularization_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  reraRegularizationPercentage: number;

  @Column({
    name: 'rera_qualification_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  reraQualificationPercentage: number;

  @Column({ name: 'maximum_regularization_days', type: 'int', nullable: true })
  maximumRegularizationDays: number;

  @Column({
    name: 'rtm_regularization_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  rtmRegularizationPercentage: number;

  @Column({
    name: 'rtm_qualification_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  rtmQualificationPercentage: number;

  @Column({ name: 'regularization_start_date', type: 'date', nullable: true })
  regularizationStartDate: string;

  @Column({ name: 'terms_and_conditions', type: 'text', nullable: true })
  termsAndConditions: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
