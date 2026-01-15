import { IsInt, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateMatchDto {
  @IsInt()
  club_id: number;

  @IsDateString()
  match_date: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  created_by?: number;
}
