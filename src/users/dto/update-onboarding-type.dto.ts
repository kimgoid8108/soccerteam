import { IsIn, IsString } from 'class-validator';

export class UpdateOnboardingTypeDto {
  @IsString()
  @IsIn(['member', 'owner'])
  onboarding_type: 'member' | 'owner';
}
