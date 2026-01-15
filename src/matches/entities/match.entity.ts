import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Club } from '../../clubs/entities/club.entity';
import { MatchAttendance } from '../../match-attendance/entities/match-attendance.entity';

@Entity('matches')
@Index('idx_matches_club', ['club_id'])
export class Match {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', name: 'club_id' })
  club_id: number;

  @Column({ type: 'timestamp', name: 'match_date' })
  match_date: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'bigint', nullable: true, name: 'created_by' })
  created_by: number | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at', nullable: true })
  created_at: Date | null;

  @ManyToOne(() => Club, (club) => club.matches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @ManyToOne(() => User, (user) => user.matches, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  created_by_user: User | null;

  @OneToMany(() => MatchAttendance, (matchAttendance) => matchAttendance.match)
  match_attendance: MatchAttendance[];
}
