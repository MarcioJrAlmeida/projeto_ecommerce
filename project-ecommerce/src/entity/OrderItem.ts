import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './Order';
import { Product } from './Product';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (o) => o.items, { nullable: false, onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Product, { nullable: false, onDelete: 'RESTRICT' })
  product: Product;

  @Column({ type: 'int' })
  quantity: number;

  // preço do produto no momento da adição
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitPrice: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  lineTotal: string; // unitPrice * quantity
}
