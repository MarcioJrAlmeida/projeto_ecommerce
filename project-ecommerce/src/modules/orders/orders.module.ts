import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../entity/Order';
import { OrderItem } from '../../entity/OrderItem';
import { Product } from '../../entity/Product';
import { Customer } from '../../entity/Customer';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product, Customer])],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
