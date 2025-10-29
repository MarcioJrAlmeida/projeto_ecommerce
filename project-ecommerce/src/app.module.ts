import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { CustomersModule } from './modules/customers/customers.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root@123',        
      database: 'ecommerce',       
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,           
      autoLoadEntities: true,      
    }),
    CategoriesModule,
    ProductsModule,
    CustomersModule,
    AddressesModule,
    OrdersModule
  ],
})
export class AppModule {}
