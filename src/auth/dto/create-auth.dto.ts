import { IsString } from '@nestjs/class-validator';

export class CreateAuthDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  name: string;
}
