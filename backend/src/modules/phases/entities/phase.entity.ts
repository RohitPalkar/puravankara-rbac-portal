import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { Brand } from '../../brands/entities/brand.entity';
import { City } from '../../geography/entities/city.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity('phases')
export class Phase extends AppBaseEntity {
  @Column({ name: 'brand_id', nullable: false })
  brandId: number;

  @ManyToOne(() => Brand, (brand) => brand.phases)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @Column({ name: 'city_id', nullable: false })
  cityId: number;

  @ManyToOne(() => City)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column({ name: 'phase_name', nullable: false })
  phaseName: string;

  @Column({ name: 'sfdc_phase_name', nullable: false })
  sfdcPhaseName: string;

  @Column({ name: 'sfdc_block_name', nullable: true })
  sfdcBlockName: string;

  @Column({ name: 'possession_date', type: 'date', nullable: false })
  possessionDate: string;

  @Column({
    name: 'agreement_execution_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  agreementExecutionPercentage: number;

  @Column({ name: 'booking_gateway_id', nullable: true })
  bookingGatewayId: string;

  @Column({ name: 'milestone_gateway_id', nullable: true })
  milestoneGatewayId: string;

  @Column({ name: 'launch_enabled', default: false })
  launchEnabled: boolean;

  @Column({ name: 'launch_start_date', type: 'date', nullable: true })
  launchStartDate: string;

  @Column({ name: 'launch_end_date', type: 'date', nullable: true })
  launchEndDate: string;

  @Column({ name: 'sustenance_enabled', default: false })
  sustenanceEnabled: boolean;

  @Column({ name: 'sustenance_date', type: 'date', nullable: true })
  sustenanceDate: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => Project, (project) => project.phase)
  projects: Project[];
}
