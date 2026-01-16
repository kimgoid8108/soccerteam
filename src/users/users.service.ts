// UsersService: 사용자 관련 비즈니스 로직을 처리하는 서비스
// - UsersController에서 사용자 CRUD 작업 시 호출
// - AuthService에서 사용자 조회 시 호출 (findByEmail)

import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, OnboardingType } from './entities/user.entity'; // 경로 맞춰서
import * as bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser)
      throw new ConflictException('이미 존재하는 이메일입니다.');

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      BCRYPT_ROUNDS,
    );

    // ✅ string -> enum 변환
    const onboarding: OnboardingType =
      createUserDto.onboarding_type === 'owner'
        ? OnboardingType.OWNER
        : OnboardingType.MEMBER;

    const user: User = this.usersRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
      name: createUserDto.name,
      age: createUserDto.age,
      onboarding_type: onboarding,
    });

    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findMeById(id: bigint): Promise<Partial<User>> {
    const user = await this.usersRepository.findOne({
      where: { id: id as any }, // entity id 타입에 맞춰 조정
      select: ['id', 'email', 'name', 'age', 'onboarding_type', 'created_at'],
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // 비밀번호 업데이트 시 해싱
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        BCRYPT_ROUNDS,
      );
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async updateOnboardingType(
    userId: string | number,
    type: 'member' | 'owner',
  ): Promise<{ ok: boolean; onboarding_type: string }> {
    // ✅ userId 타입 맞추기
    // 엔티티 id가 number면 Number(userId)
    // bigint면 BigInt(userId)
    const id = typeof userId === 'string' ? Number(userId) : Number(userId);

    const user = await this.usersRepository.findOne({ where: { id } as any });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    // 해당 메서드에서도 string -> enum 변환
    user.onboarding_type =
      type === 'owner' ? OnboardingType.OWNER : OnboardingType.MEMBER;
    await this.usersRepository.save(user);

    return {
      ok: true,
      onboarding_type: user.onboarding_type,
    };
  }
}
