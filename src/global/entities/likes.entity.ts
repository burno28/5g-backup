import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { ProductsEntity } from './products.entity';
import { UserEntity } from './users.entity';

@Entity({ name: 'likes' })
export class LikesEntity {
  @PrimaryColumn()
  @OneToOne(() => UserEntity)
  userId: number;

  @OneToOne(() => ProductsEntity)
  @PrimaryColumn()
  productId: number;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn({ default: null })
  deletedAt?: Date;
}
