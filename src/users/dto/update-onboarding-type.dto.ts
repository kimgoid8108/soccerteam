import { IsIn } from 'class-validator';

export class UpdateOnboardingTypeDto {
  @IsIn(['member', 'owner'])
  onboarding_type: 'member' | 'owner';
}
