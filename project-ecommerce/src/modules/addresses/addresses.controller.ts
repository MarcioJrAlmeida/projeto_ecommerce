import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from '../../dto/address.dto';

@Controller()
export class AddressesController {
  constructor(private service: AddressesService) {}

  // nested: /customers/:customerId/addresses
  @Get('customers/:customerId/addresses')
  list(@Param('customerId', ParseIntPipe) customerId: number) {
    return this.service.listByCustomer(customerId);
  }

  @Post('customers/:customerId/addresses')
  create(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Body() dto: CreateAddressDto,
  ) {
    return this.service.create(customerId, dto);
  }

  @Get('addresses/:id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.service.get(id);
  }

  @Put('addresses/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAddressDto) {
    return this.service.update(id, dto);
  }

  @Delete('addresses/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
