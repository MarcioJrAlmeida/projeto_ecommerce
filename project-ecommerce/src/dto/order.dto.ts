import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { OrderStatus } from '../entity/Order';

export class CreateOrderDto {
  @IsInt() @IsPositive()
  customerId: number;
}

export class AddItemDto {
  @IsInt() @IsPositive()
  productId: number;

  @IsInt() @IsPositive()
  quantity: number;
}

export class UpdateItemDto {
  @IsInt() @IsPositive()
  quantity: number;
}

export class ChangeStatusDto {
  @IsEnum(['ABERTO','AGUARDANDO_PAGAMENTO','PAGO','CANCELADO'] as const)
  status: OrderStatus;
}
