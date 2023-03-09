import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ProductsEntity } from './products.entity';

@Entity({ name: 'productimages' })
export class ProductImagesEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => ProductsEntity)
  productsId: number;

  @Column()
  imagePath: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn({ default: null })
  deletedAt?: Date;
}
