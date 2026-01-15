import { IsInt, IsEnum, IsOptional } from 'class-validator';
import { JoinRequestStatus } from '../entities/join-request.entity';

export class CreateJoinRequestDto {
  @IsInt()
  club_id: number;

  @IsInt()
  user_id: number;

  @IsOptional()
  @IsEnum(JoinRequestStatus)
  status?: JoinRequestStatus;
}
