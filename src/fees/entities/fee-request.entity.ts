import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { FeeCycle } from './fee-cycle.entity';
import { Club } from '../../clubs/entities/club.entity';
import { User } from '../../users/entities/user.entity';

export enum FeeRequestStatus {
  NOT_PAID = 'not_paid',
  REPORTED_PAID = 'reported_paid',
  CONFIRMED = 'confirmed',
}

@Entity({ schema: 'football', name: 'fee_requests' })
@Unique(['fee_cycle_id', 'user_id'])
@Index('idx_fee_requests_cycle', ['fee_cycle_id'])
@Index('idx_fee_requests_user', ['user_id'])
@Index('idx_fee_requests_club', ['club_id'])
export class FeeRequest {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', name: 'fee_cycle_id' })
  fee_cycle_id: number;

  @Column({ type: 'bigint', name: 'club_id' })
  club_id: number;

  @Column({ type: 'bigint', name: 'user_id' })
  user_id: number;

  @Column({
    type: 'enum',
    enum: FeeRequestStatus,
    default: FeeRequestStatus.NOT_PAID,
  })
  status: FeeRequestStatus;

  @Column({ type: 'timestamp', nullable: true, name: 'reported_at' })
  reported_at: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'confirmed_at' })
  confirmed_at: Date | null;

  @Column({ type: 'bigint', nullable: true, name: 'confirmed_by' })
  confirmed_by: number | null;

  @Column({ type: 'text', nullable: true, name: 'admin_note' })
  admin_note: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => FeeCycle, (feeCycle) => feeCycle.fee_requests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fee_cycle_id' })
  fee_cycle: FeeCycle;

  @ManyToOne(() => Club, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'confirmed_by' })
  confirmed_by_user: User | null;
}
