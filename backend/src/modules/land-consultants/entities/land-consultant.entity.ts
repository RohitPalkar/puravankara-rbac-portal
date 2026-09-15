import { Entity, Column, Index } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity';

export enum ConsultantType {
  INDIVIDUAL = 'Individual',
  REGISTERED = 'Registered',
}

@Entity('land_consultants')
export class LandConsultant extends AppBaseEntity {
  @Index()
  @Column({ name: 'consultant_type', type: 'varchar', length: 20 })
  consultantType: string;

  // For Registered: Business Name, for Individual: Consultant Name
  // Unified as display name + separate fields for clarity
  @Column({ name: 'business_name', nullable: true })
  businessName: string;

  @Column({ name: 'consultant_name', nullable: true })
  consultantName: string;

  @Column({ name: 'gst_no', nullable: true })
  gstNo: string;

  @Column({ name: 'contact_person_name' })
  contactPersonName: string;

  @Column({ name: 'contact_number' })
  contactNumber: string;

  @Column({ name: 'email_address' })
  emailAddress: string;

  @Column({ name: 'address', type: 'text' })
  address: string;

  @Column({ name: 'specialization', nullable: true })
  specialization: string;

  @Index()
  @Column({ name: 'bd_executive_id' })
  bdExecutiveId: string;

  @Column({ name: 'is_puravankara_employee', default: false })
  isPuravankaraEmployee: boolean;

  @Column({ name: 'department_id', type: 'int', nullable: true })
  departmentId: number;

  @Column({ name: 'employee_id', nullable: true })
  employeeId: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // Counters for list view (Figma: Proposed S0, S1/S2, MOU/JDA)
  // Kept as virtual / future relation counts - default 0
  @Column({ name: 'proposed_s0_count', type: 'int', default: 0 })
  proposedS0Count: number;

  @Column({ name: 's1_s2_count', type: 'int', default: 0 })
  s1s2Count: number;

  @Column({ name: 'mou_jda_count', type: 'int', default: 0 })
  mouJdaCount: number;
}
