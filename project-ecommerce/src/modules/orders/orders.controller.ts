import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AddItemDto, ChangeStatusDto, CreateOrderDto, UpdateItemDto } from '../../dto/order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private service: OrdersService) {}

  @Get()
  list() {
    return this.service.list();
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

  @Delete(':orderId/items/:itemId')
  removeItem(@Param('orderId', ParseIntPipe) orderId: number, @Param('itemId', ParseIntPipe) itemId: number) {
    return this.service.removeItem(orderId, itemId);
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
