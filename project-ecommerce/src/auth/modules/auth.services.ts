import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Customer } from '../../entity/Customer';
import { Address } from '../../entity/Address';
import { RegisterDto } from '../dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Customer) private readonly customersRepo: Repository<Customer>,
    @InjectRepository(Address) private readonly addressRepo: Repository<Address>,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.customersRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('E-mail já cadastrado.');

    // const passwordHash = await bcrypt.hash(dto.password, 10);

    const customer = this.customersRepo.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      // passwordHash,
    });

    const saved = await this.customersRepo.save(customer);

    if (dto.address) {
      const address = this.addressRepo.create({
        customer: saved,
        line1: dto.address, // ajuste para os campos reais da sua Address
      } as any);
      await this.addressRepo.save(address);
    }

    // Evita vazar o hash
    const { passwordHash: _ph, ...safe } = saved;
    return safe;
  }
}
