import { IsOptional, IsString } from 'class-validator';

export class ConfirmFeeRequestDto {
  @IsOptional()
  @IsString()
  admin_note?: string;
}
