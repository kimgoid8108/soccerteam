import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ClubMember } from '../../club-members/entities/club-member.entity';
import { Club } from '../../clubs/entities/club.entity';
import { JoinRequest } from '../../join-requests/entities/join-request.entity';
import { MatchAttendance } from '../../match-attendance/entities/match-attendance.entity';
import { Match } from '../../matches/entities/match.entity';
import { Notification } from '../../notifications/entities/notification.entity';

export enum OnboardingType {
  OWNER = 'owner',
  MEMBER = 'member',
}

@Entity({ schema: 'football', name: 'clubs' })
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'int' })
  age: number;

  @Column({
    type: 'enum',
    enum: OnboardingType,
  })
  onboarding_type: OnboardingType;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at: Date;

  @OneToMany(() => ClubMember, (clubMember) => clubMember.user)
  club_members: ClubMember[];

  @OneToMany(() => Club, (club) => club.admin_user)
  clubs: Club[];

  @OneToMany(() => JoinRequest, (joinRequest) => joinRequest.user)
  join_requests: JoinRequest[];

  @OneToMany(() => MatchAttendance, (matchAttendance) => matchAttendance.user)
  match_attendance: MatchAttendance[];

  @OneToMany(() => Match, (match) => match.created_by_user)
  matches: Match[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}
