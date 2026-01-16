import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { OnboardingType } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email },
    });
  }

  async findById(id: number | string): Promise<User | null> {
    const userId = typeof id === 'string' ? Number(id) : id;
    return await this.usersRepository.findOne({
      where: { id: userId },
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return await this.usersRepository.save(user);
  }

  async updateOnboardingType(
    id: number | string,
    onboardingType: 'member' | 'owner',
  ): Promise<User> {
    const userId = typeof id === 'string' ? Number(id) : id;

    await this.usersRepository.update(userId, {
      onboarding_type: OnboardingType[onboardingType],
    });

    const updatedUser = await this.findById(userId);
    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser;
  }
}
