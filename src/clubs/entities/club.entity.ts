import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ClubMember } from '../../club-members/entities/club-member.entity';
import { JoinRequest } from '../../join-requests/entities/join-request.entity';
import { Match } from '../../matches/entities/match.entity';

@Entity({ schema: 'football', name: 'clubs' })
export class Club {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'date', nullable: true, name: 'founded_at' })
  founded_at: Date | null;

  @Column({ type: 'varchar', nullable: true, name: 'watermark_url' })
  watermark_url: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'bigint', name: 'admin_user_id' })
  admin_user_id: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.clubs)
  @JoinColumn({ name: 'admin_user_id' })
  admin_user: User;

  @OneToMany(() => ClubMember, (clubMember) => clubMember.club)
  club_members: ClubMember[];

  @OneToMany(() => JoinRequest, (joinRequest) => joinRequest.club)
  join_requests: JoinRequest[];

  @OneToMany(() => Match, (match) => match.club)
  matches: Match[];
}
