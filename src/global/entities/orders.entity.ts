import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ProductsEntity } from './products.entity';
import { UserEntity } from './users.entity';

@Entity({ name: 'orders' })
export class OrdersEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProductsEntity)
  product: ProductsEntity;
  @Column()
  productId: number;

  @ManyToOne(() => UserEntity, (buyer) => buyer.orders)
  buyer: UserEntity;
  @Column()
  buyerId: number;

  @Column()
  deal: number;

  @Column({ default: 'sale' })
  status: string;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn({ default: null })
  updateAt?: Date;

  @DeleteDateColumn({ default: null })
  deleteAt?: Date;
}
