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
import { User } from '../../users/entities/user.entity';
import { Match } from '../../matches/entities/match.entity';

export enum AttendanceStatus {
  YES = 'yes',
  NO = 'no',
  UNDECIDED = 'undecided',
}

@Entity('match_attendance')
@Unique(['match_id', 'user_id'])
@Index('idx_match_attendance_user', ['user_id'])
export class MatchAttendance {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', name: 'match_id' })
  match_id: number;

  @Column({ type: 'bigint', name: 'user_id' })
  user_id: number;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.UNDECIDED,
  })
  status: AttendanceStatus;

  @CreateDateColumn({ type: 'timestamp', name: 'undated_at', nullable: true })
  undated_at: Date | null;

  @ManyToOne(() => Match, (match) => match.match_attendance, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @ManyToOne(() => User, (user) => user.match_attendance, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
