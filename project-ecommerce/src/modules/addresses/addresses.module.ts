import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from '../../entity/Address';
import { Customer } from '../../entity/Customer';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Address, Customer])],
  controllers: [AddressesController],
  providers: [AddressesService],
})
export class AddressesModule {}
