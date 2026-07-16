import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { Brand } from '../../brands/entities/brand.entity';
import { City } from '../../geography/entities/city.entity';
import { ProjectPaymentGateway } from './project-payment-gateway.entity';
import { ProjectIncentiveRule } from './project-incentive-rule.entity';

@Entity('projects')
export class Project extends AppBaseEntity {
  @Column({ name: 'brand_id', nullable: false })
  brandId: number;

  @ManyToOne(() => Brand)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @Column({ name: 'city_id', nullable: false })
  cityId: number;

  @ManyToOne(() => City)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ name: 'billing_entity_name', nullable: true })
  billingName: string;

  @Column({ name: 'billing_gstin', nullable: true })
  gstin: string;

  @Column({ name: 'pan_number', nullable: true })
  panNumber: string;

  @Column({ name: 'address_1', nullable: true })
  address1: string;

  @Column({ name: 'address_2', nullable: true })
  address2: string;

  @Column({ name: 'pin_code', nullable: true })
  pinCode: string;

  @Column({ name: 'project_image', nullable: true })
  projectImage: string;

  @Column({ name: 'jv_logo', nullable: true })
  jvLogo: string;

  @Column({ name: 'sfdc_project_name', nullable: true })
  sfdcProjectName: string;

  @Column({ name: 'codename', nullable: true })
  codename: string;

  @Column({ name: 'terms_html', type: 'text', nullable: true })
  termsHtml: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'extended_metadata', type: 'jsonb', nullable: true })
  extendedMetadata: Record<string, any>;

  @OneToMany(() => ProjectPaymentGateway, (g) => g.project, { cascade: true })
  paymentGateways: ProjectPaymentGateway[];

  @OneToMany(() => ProjectIncentiveRule, (r) => r.project, { cascade: true })
  incentiveRules: ProjectIncentiveRule[];
}
