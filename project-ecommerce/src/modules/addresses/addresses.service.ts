import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../../entity/Address';
import { Customer } from '../../entity/Customer';
import { CreateAddressDto, UpdateAddressDto } from '../../dto/address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address) private addresses: Repository<Address>,
    @InjectRepository(Customer) private customers: Repository<Customer>,
  ) {}

  async listByCustomer(customerId: number) {
    return this.addresses.find({
      where: { customer: { id: customerId } },
      order: { isDefault: 'DESC', id: 'DESC' },
    });
  }

  async get(id: number) {
    const found = await this.addresses.findOne({ where: { id }, relations: ['customer'] });
    if (!found) throw new NotFoundException('Address not found');
    return found;
  }

  /**
   * regra: se criar com isDefault = true, remove o default dos outros endereços do cliente
   */
  async create(customerId: number, dto: CreateAddressDto) {
    const customer = await this.customers.findOne({ where: { id: customerId } });
    if (!customer) throw new NotFoundException('Customer not found');

    if (dto.isDefault) {
      await this.addresses.update({ customer: { id: customerId }, isDefault: true }, { isDefault: false });
    }

    const entity = this.addresses.create({ ...dto, customer });
    return this.addresses.save(entity);
  }

  async update(id: number, dto: UpdateAddressDto) {
    const addr = await this.addresses.findOne({ where: { id }, relations: ['customer'] });
    if (!addr) throw new NotFoundException('Address not found');

    if (dto.isDefault === true) {
      await this.addresses.update({ customer: { id: addr.customer.id }, isDefault: true }, { isDefault: false });
    }

    Object.assign(addr, dto);
    return this.addresses.save(addr);
  }

  async remove(id: number) {
    const res = await this.addresses.delete(id);
    if (!res.affected) throw new NotFoundException('Address not found');
    return { deleted: true };
  }
}
