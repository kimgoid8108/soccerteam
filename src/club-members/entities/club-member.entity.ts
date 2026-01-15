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
import { Club } from '../../clubs/entities/club.entity';

export enum ClubRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum MemberStatus {
  ACTIVE = 'active',
  LEFT = 'left',
}

@Entity('club_members')
@Unique(['club_id', 'user_id'])
@Index('idx_club_members_club', ['club_id'])
@Index('idx_club_members_user', ['user_id'])
export class ClubMember {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', name: 'club_id' })
  club_id: number;

  @Column({ type: 'bigint', name: 'user_id' })
  user_id: number;

  @Column({
    type: 'enum',
    enum: ClubRole,
    default: ClubRole.MEMBER,
  })
  role: ClubRole;

  @Column({
    type: 'enum',
    enum: MemberStatus,
    default: MemberStatus.ACTIVE,
  })
  status: MemberStatus;

  @CreateDateColumn({ type: 'timestamp', name: 'joined_at', nullable: true })
  joined_at: Date | null;

  @ManyToOne(() => Club, (club) => club.club_members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @ManyToOne(() => User, (user) => user.club_members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
