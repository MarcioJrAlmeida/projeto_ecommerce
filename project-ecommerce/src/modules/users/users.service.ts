import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entity/Users';
import { CreateUserDto, UpdateUserDto } from '../../dto/user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findAllSafe() {
    const users = await this.repo.find();
    return users.map(({ id, email, role, createdAt, updatedAt }) => ({
      id,
      email,
      role,
      createdAt,
      updatedAt,
    }));
  }

  async findSafeById(id: number) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    const { email, role, createdAt, updatedAt } = user;
    return { id, email, role, createdAt, updatedAt };
  }

  /** Cria usuário com hash de senha, retorna dados seguros */
  async create(dto: CreateUserDto) {
    const exists = await this.findByEmail(dto.email);
    if (exists) throw new ConflictException('Email já cadastrado');

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = this.repo.create({
      email: dto.email,
      password: hashed,
      role: dto.role ?? 'cliente',
    });

    const saved = await this.repo.save(user);
    const { id, email, role, createdAt, updatedAt } = saved;
    return { id, email, role, createdAt, updatedAt };
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');

    if (dto.email) user.email = dto.email;
    if (dto.role) user.role = dto.role;
    if (dto.password) user.password = await bcrypt.hash(dto.password, 10);

    const saved = await this.repo.save(user);
    const { email, role, createdAt, updatedAt } = saved;
    return { id, email, role, createdAt, updatedAt };
  }

  async remove(id: number) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    await this.repo.delete(id);
    return { success: true };
  }
}
