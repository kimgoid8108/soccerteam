import { IsEmail, IsString, IsInt, IsEnum, MinLength } from 'class-validator';
import { OnboardingType } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsInt()
  age: number;

  @IsEnum(OnboardingType)
  onboarding_type: OnboardingType;
}
