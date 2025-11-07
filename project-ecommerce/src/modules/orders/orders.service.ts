import { Repository, SelectQueryBuilder, DataSource } from 'typeorm';
import { Order } from '../../entity/Order';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from '../../entity/OrderItem';
import { Product } from '../../entity/Product';
import { Customer } from '../../entity/Customer';
import { AddItemDto, CreateOrderDto, UpdateItemDto } from '../../dto/order.dto';

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

    
    if (params.customerId) {
      
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
export class OrderService {
  constructor(
    @InjectRepository(Order) private orders: Repository<Order>,
    @InjectRepository(OrderItem) private items: Repository<OrderItem>,
    @InjectRepository(Product) private products: Repository<Product>,
    @InjectRepository(Customer) private customers: Repository<Customer>,
    private ds: DataSource,
  ) {}

  list() {
    return this.orders.find({ relations: ['customer'], order: { id: 'DESC' } });
  }

  get(id: number) {
    return this.orders.findOne({ where: { id }, relations: ['customer', 'items', 'items.product'] });
  }

  async create(dto: CreateOrderDto) {
    const customer = await this.customers.findOne({ where: { id: dto.customerId } });
    if (!customer) throw new NotFoundException('Customer not found');
    const o = this.orders.create({ customer, status: 'ABERTO', subtotal: '0.00', total: '0.00', totalItems: 0 });
    return this.orders.save(o);
  }

  async addItem(orderId: number, dto: AddItemDto) {
    const order = await this.getOrThrow(orderId);
    this.ensureEditable(order);

    const product = await this.products.findOne({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found');


    if (product.stock < dto.quantity) {
      throw new BadRequestException('Insufficient stock for product');
    }


    let item = await this.items.findOne({ where: { order: { id: order.id }, product: { id: product.id } }, relations: ['order','product'] });
    const unitPrice = product.price; // string decimal
    if (item) {
      item.quantity += dto.quantity;
      item.lineTotal = (Number(unitPrice) * item.quantity).toFixed(2);
    } else {
      item = this.items.create({
        order,
        product,
        quantity: dto.quantity,
        unitPrice,
        lineTotal: (Number(unitPrice) * dto.quantity).toFixed(2),
      });
    }
    await this.items.save(item);
    await this.recalcTotals(order.id);
    return this.get(order.id);
  }

  async updateItem(orderId: number, itemId: number, dto: UpdateItemDto) {
    const order = await this.getOrThrow(orderId);
    this.ensureEditable(order);

    const item = await this.items.findOne({ where: { id: itemId, order: { id: order.id } }, relations: ['product','order'] });
    if (!item) throw new NotFoundException('Item not found');

    // checar estoque para a nova quantidade
    if (item.product.stock < dto.quantity) {
      throw new BadRequestException('Insufficient stock for product');
    }

    item.quantity = dto.quantity;
    item.lineTotal = (Number(item.unitPrice) * item.quantity).toFixed(2);
    await this.items.save(item);
    await this.recalcTotals(order.id);
    return this.get(order.id);
  }

  async removeItem(orderId: number) {
    const order = await this.getOrThrow(orderId);
    this.ensureEditable(order);

    const res = await this.items.delete({order: { id: order.id } });
    if (!res.affected) throw new NotFoundException('Item not found');
    await this.recalcTotals(order.id);
    return this.get(order.id);
  }

    async setStatus(orderId: number, status: Order['status']) {
      const order = await this.getOrThrow(orderId);
    
      // se já está pago, não permite mais nenhuma mudança
      if (order.status === 'PAGO') {
        throw new BadRequestException('Paid order cannot change');
      }
  
      // pagar: debita estoque + marca PAGO
      if (status === 'PAGO') {
        await this.pay(orderId);
        return this.get(orderId);
      }
  
      // cancelar: só chega aqui se NÃO for PAGO (já barramos acima)
      if (status === 'CANCELADO') {
        order.status = 'CANCELADO';
        return this.orders.save(order);
      }
  
      // ABERTO <-> AGUARDANDO_PAGAMENTO
      order.status = status;
      return this.orders.save(order);
    }

  /** confirmação de pagamento + débito de estoque (transação) */
  async pay(orderId: number) {
    const order = await this.getOrThrow(orderId);
    if (order.status === 'PAGO') return order;
    if (!order.items?.length) throw new BadRequestException('Order has no items');

    // checar estoque de todos antes de debitar
    for (const it of order.items) {
      const product = await this.products.findOne({ where: { id: it.product.id } });
      if (!product || product.stock < it.quantity) {
        throw new BadRequestException(`Insufficient stock for product ${it.product.id}`);
      }
    }

    const qr = this.ds.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      // debitar estoque
      for (const it of order.items) {
        await qr.manager.decrement(Product, { id: it.product.id }, 'stock', it.quantity);
      }
      // marcar como pago
      await qr.manager.update(Order, { id: order.id }, { status: 'PAGO' });
      await qr.commitTransaction();
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
    return this.get(order.id);
  }

  // ------- helpers -------
  private async recalcTotals(orderId: number) {
    const order = await this.getOrThrow(orderId);
    const items = await this.items.find({ where: { order: { id: orderId } } });
    const subtotal = items.reduce((acc, i) => acc + Number(i.lineTotal), 0);
    order.subtotal = subtotal.toFixed(2);
    order.totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
    order.total = order.subtotal; // por enquanto sem frete/impostos
    await this.orders.save(order);
  }

  private async getOrThrow(id: number) {
    const o = await this.get(id);
    if (!o) throw new NotFoundException('Order not found');
    return o;
  }

  private ensureEditable(order: Order) {
    if (order.status === 'PAGO') throw new BadRequestException('Paid order cannot be edited');
    if (order.status === 'CANCELADO') throw new BadRequestException('Canceled order cannot be edited');
  }
}
