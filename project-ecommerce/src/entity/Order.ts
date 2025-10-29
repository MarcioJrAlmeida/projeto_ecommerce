import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Customer } from './Customer';
import { OrderItem } from './OrderItem';

export type OrderStatus = 'ABERTO' | 'AGUARDANDO_PAGAMENTO' | 'PAGO' | 'CANCELADO';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, { nullable: false, onDelete: 'RESTRICT' })
  customer: Customer;

  @Column({ type: 'enum', enum: ['ABERTO', 'AGUARDANDO_PAGAMENTO', 'PAGO', 'CANCELADO'], default: 'ABERTO' })
  status: OrderStatus;

  // Totais armazenados para leitura rápida; mantidos pelo service
  @Column({ type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  subtotal: string;

  @Column({ type: 'int', default: 0 })
  totalItems: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  total: string;

  @OneToMany(() => OrderItem, (i) => i.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
