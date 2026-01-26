import { IsInt, IsString, IsOptional } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class CreateClubNotificationDto {
  @IsInt()
  club_id: number;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  type?: NotificationType;
}
