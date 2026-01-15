import { IsInt, IsEnum, IsOptional } from 'class-validator';
import { ClubRole, MemberStatus } from '../entities/club-member.entity';

export class CreateClubMemberDto {
  @IsInt()
  club_id: number;

  @IsInt()
  user_id: number;

  @IsOptional()
  @IsEnum(ClubRole)
  role?: ClubRole;

  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;
}
