import {
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategoriesEntity } from './categories.entity';
import { UserEntity } from './users.entity';
import { OrdersEntity } from './orders.entity';

@Entity({ name: 'products' })
export class ProductsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  price: number;

  @ManyToOne(() => UserEntity, (seller) => seller.products)
  seller: UserEntity;
  @Column()
  sellerId: number;

  @ManyToOne(() => CategoriesEntity, (category) => category.products)
  category: CategoriesEntity;
  @Column()
  categoryId: number;

  @Column({default:0})
  viewCount: number;

  @Column({default:0})
  likes: number;

  @Column({ default: 'sale' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ default: null })
  updatedAt?: Date;

  @OneToMany((type) => OrdersEntity, (orders) => orders.product)
  orders: OrdersEntity[];
}
