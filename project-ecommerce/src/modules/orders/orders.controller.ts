import { Controller, Get, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('customerId') customerId?: string, // 👈 filtro por usuário (customer)
  ) {
    return this.ordersService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 12,
      status: status || undefined,
      search: search || undefined,
      customerId: customerId ? Number(customerId) : undefined, // 👈 aplica filtro
    });
  }
}
