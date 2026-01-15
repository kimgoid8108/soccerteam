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

export enum NotificationType {
  JOIN_REQUEST = 'join_request',
  JOIN_APPROVED = 'join_approved',
  JOIN_REJECTED = 'join_rejected',
  MATCH_CREATED = 'match_created',
}

@Entity('notifications')
@Index('idx_notifications_user', ['user_id'])
export class Notification {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', name: 'user_id' })
  user_id: number;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'boolean', default: false, name: 'is_read' })
  is_read: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at', nullable: true })
  created_at: Date | null;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
