import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersEntity } from 'src/global/entities/orders.entity';
import { UserEntity } from 'src/global/entities/users.entity';
import { ProductsEntity } from 'src/global/entities/products.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrdersEntity, UserEntity, ProductsEntity]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, JwtService],
})
export class OrdersModule {}
