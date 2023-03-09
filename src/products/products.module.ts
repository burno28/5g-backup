import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesEntity } from 'src/global/entities/categories.entity';
import { ProductsEntity } from 'src/global/entities/products.entity';
import { UserEntity } from 'src/global/entities/users.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([CategoriesEntity,UserEntity,ProductsEntity]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, JwtService]
})
export class ProductsModule {}
 