import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductsEntity } from './products.entity';

@Entity({ name: 'categories' })
export class CategoriesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn({ default: null })
  deletedAt?: Date;

  @OneToMany((type) => ProductsEntity, (products) => products.category)
  products: ProductsEntity[];
}
