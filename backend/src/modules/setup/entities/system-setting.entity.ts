import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('system_settings')
export class SystemSetting {
  @PrimaryColumn({ nullable: false })
  key: string;

  @Column({ type: 'jsonb', nullable: false })
  value: Record<string, any>;
}
