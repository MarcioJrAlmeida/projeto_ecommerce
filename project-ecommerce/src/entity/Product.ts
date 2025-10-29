import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Index } from 'typeorm';
import { Category } from './Category';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ length: 180 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: string; // TypeORM retorna decimal como string (ok)

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  imageUrl?: string;

  @ManyToOne(() => Category, (c) => c.products, { nullable: false, onDelete: 'RESTRICT' })
  category: Category;
}
