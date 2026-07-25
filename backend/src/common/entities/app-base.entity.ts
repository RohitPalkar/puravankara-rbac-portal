import { Exclude } from 'class-transformer';
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
} from 'typeorm';

export abstract class AppBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Exclude()
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date | null;

  @Exclude()
  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @Exclude()
  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;
}
