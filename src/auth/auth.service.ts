import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { OnboardingType } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly INVALID_CREDENTIALS_MESSAGE =
    '이메일 또는 비밀번호가 올바르지 않습니다.';

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    // 이메일 중복 확인
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 회원가입 처리
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
      onboarding_type:
        createUserDto.onboarding_type === 'owner'
          ? OnboardingType.OWNER
          : OnboardingType.MEMBER,
    });

    // JWT 토큰 생성
    const accessToken = this.jwtService.sign({
      sub: user.id,
    });

    return {
      accessToken,
      user: {
        email: user.email,
      },
    };
  }

  async login(loginDto: { email: string; password: string }) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException(this.INVALID_CREDENTIALS_MESSAGE);
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password, // 혹시 DB에서 가져오는 필드가 hashed_password라면 user.hashed_password로 수정
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(this.INVALID_CREDENTIALS_MESSAGE);
    }

    // JWT 토큰 생성
    const accessToken = this.jwtService.sign({
      sub: user.id,
    });

    return {
      accessToken,
      user: {
        email: user.email,
      },
    };
  }

  async me(userId: string | number) {
    const id = typeof userId === 'string' ? Number(userId) : userId;
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      age: user.age,
      onboarding_type: user.onboarding_type,
    };
  }
}
