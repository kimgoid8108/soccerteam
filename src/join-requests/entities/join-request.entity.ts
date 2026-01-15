import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Club } from '../../clubs/entities/club.entity';

export enum JoinRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('join_requests')
@Index('idx_join_requests_club', ['club_id'])
export class JoinRequest {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', name: 'club_id' })
  club_id: number;

  @Column({ type: 'bigint', name: 'user_id' })
  user_id: number;

  @Column({
    type: 'enum',
    enum: JoinRequestStatus,
    default: JoinRequestStatus.PENDING,
  })
  status: JoinRequestStatus;

  @CreateDateColumn({ type: 'timestamp', name: 'requested_at', nullable: true })
  requested_at: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'responded_at' })
  responded_at: Date | null;

  @ManyToOne(() => Club, (club) => club.join_requests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @ManyToOne(() => User, (user) => user.join_requests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
