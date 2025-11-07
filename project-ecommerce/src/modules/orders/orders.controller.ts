import { Query, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { AddItemDto, ChangeStatusDto, CreateOrderDto, UpdateItemDto } from '../../dto/order.dto';
import { OrdersService, OrderService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private service: OrderService
  ) {}

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

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.service.get(id);
  }

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.service.create(dto);
  }

  @Post(':id/items')
  addItem(@Param('id', ParseIntPipe) id: number, @Body() dto: AddItemDto) {
    return this.service.addItem(id, dto);
  }

  @Put(':orderId/items/:itemId')
  updateItem(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateItemDto,
  ) {
    return this.service.updateItem(orderId, itemId, dto);
  }

  @Delete(':id/items/')
  removeItem(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.service.removeItem(orderId);
  }

  @Put(':id/status')
  changeStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: ChangeStatusDto) {
    return this.service.setStatus(id, dto.status);
  }

  @Post(':id/pay')
  pay(@Param('id', ParseIntPipe) id: number) {
    return this.service.pay(id);
  }
}
