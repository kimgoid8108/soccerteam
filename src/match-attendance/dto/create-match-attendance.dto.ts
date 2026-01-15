import { IsInt, IsEnum, IsOptional } from 'class-validator';
import { AttendanceStatus } from '../entities/match-attendance.entity';

export class CreateMatchAttendanceDto {
  @IsInt()
  match_id: number;

  @IsInt()
  user_id: number;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;
}
