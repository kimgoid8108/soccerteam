import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Club } from '../../clubs/entities/club.entity';
import { User } from '../../users/entities/user.entity';
import { FeeRequest } from './fee-request.entity';

@Entity({ schema: 'football', name: 'fee_cycles' })
export class FeeCycle {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', name: 'club_id' })
  club_id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date', name: 'due_date' })
  due_date: Date;

  @Column({ type: 'varchar', length: 100, name: 'bank_name' })
  bank_name: string;

  @Column({ type: 'varchar', length: 100, name: 'bank_account' })
  bank_account: string;

  @Column({ type: 'varchar', length: 100, name: 'bank_holder' })
  bank_holder: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'bank_memo_rule' })
  bank_memo_rule: string | null;

  @Column({ type: 'bigint', name: 'created_by' })
  created_by: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => Club, (club) => club.fee_cycles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  created_by_user: User;

  @OneToMany(() => FeeRequest, (feeRequest) => feeRequest.fee_cycle)
  fee_requests: FeeRequest[];
}
