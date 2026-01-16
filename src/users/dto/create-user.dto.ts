import {
  IsEmail,
  IsInt,
  IsString,
  MinLength,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsInt()
  age: number;

  @IsOptional()
  @IsIn(['member', 'owner'])
  onboarding_type?: 'member' | 'owner';
}
