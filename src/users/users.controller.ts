import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateOnboardingTypeDto } from './dto/update-onboarding-type.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('me/onboarding-type')
  async updateOnboardingType(
    @CurrentUser() user: { id: string | number },
    @Body() dto: UpdateOnboardingTypeDto,
  ) {
    return this.usersService.updateOnboardingType(user.id, dto.onboarding_type);
  }
}
