import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../modules/auth.services';
import { RegisterDto } from '../../auth/dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
