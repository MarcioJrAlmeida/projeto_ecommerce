import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto/login.dto';
import { UsersService } from '../../modules/users/users.service';
import { User } from '../../entity/Users';
import { RegisterDto } from '../dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
  ) {}

  /** Registro de usuário (cliente ou admin) */
  async register(dto: RegisterDto) {
    // já existe?
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email já cadastrado');
    }

    // delega criação para UsersService (ele já faz hash da senha)
    const created = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      role: dto.role ?? 'cliente',
    });

    // gera um token já logado
    const payload = { sub: created.id, email: created.email, role: created.role };
    const access_token = await this.jwt.signAsync(payload);

    return { access_token };
  }

  /** Login com email + senha */
  async login(dto: LoginDto) {
    const user: User | null = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = await this.jwt.signAsync(payload);

    return { access_token };
  }
}
