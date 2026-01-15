import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    // 회원가입 요청을 AuthService의 signup 메소드에 전달
    return this.authService.signup(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    // 로그인 요청을 AuthService의 login 메소드에 전달
    return this.authService.login(loginDto);
  }
}
