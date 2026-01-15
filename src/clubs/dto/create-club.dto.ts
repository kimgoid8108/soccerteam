import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateClubDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsDateString()
  founded_at?: string;

  @IsOptional()
  @IsString()
  watermark_url?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
