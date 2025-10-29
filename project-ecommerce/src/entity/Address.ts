import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Customer } from './Customer';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  street: string;

  @Column({ length: 20 })
  number: string;

  @Column({ length: 120, nullable: true })
  complement?: string;

  @Column({ length: 120 })
  district: string;

  @Column({ length: 120 })
  city: string;

  @Column({ length: 2 })            // UF (ex.: PE, SP). Se preferir, aumente.
  state: string;

  @Column({ length: 12 })           // CEP sem máscara ou com, a seu critério
  zipCode: string;

  @Column({ default: false })
  isDefault: boolean;

  @ManyToOne(() => Customer, (c) => c.addresses, { nullable: false, onDelete: 'CASCADE' })
  customer: Customer;
}
