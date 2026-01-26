import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateFeeCycleDto {
  @IsNumber()
  club_id: number;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  due_date: string;

  @IsString()
  bank_name: string;

  @IsString()
  bank_account: string;

  @IsString()
  bank_holder: string;

  @IsOptional()
  @IsString()
  bank_memo_rule?: string;
}
