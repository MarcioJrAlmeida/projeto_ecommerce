import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Order } from '../../entity/Order';

type FindAllParams = {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  customerId?: number; // 👈 filtro por usuário
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly repo: Repository<Order>,
  ) {}

  private baseQB(): SelectQueryBuilder<Order> {
    return this.repo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.customer', 'customer')
      .leftJoinAndSelect('o.items', 'items')
      .leftJoinAndSelect('items.product', 'product');
  }

  async findAll(params: FindAllParams) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.max(1, Math.min(100, params.limit ?? 12));

    const qb = this.baseQB();

    // 👇 aplica filtro por usuário (customerId) quando informado
    if (params.customerId) {
      // ajuste o nome da coluna se na sua entidade for diferente (ex.: o.customer_id)
      qb.andWhere('o.customerId = :cid', { cid: params.customerId });
    }

    if (params.status) {
      qb.andWhere('o.status = :status', { status: params.status });
    }

    if (params.search) {
      const s = `%${params.search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(o.code) LIKE :s OR LOWER(customer.name) LIKE :s OR LOWER(customer.email) LIKE :s)',
        { s },
      );
    }

    qb.orderBy('o.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();

    return {
      items: rows,
      total,
      page,
      limit,
    };
  }
}
