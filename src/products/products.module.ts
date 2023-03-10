import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesEntity } from 'src/global/entities/categories.entity';
import { ProductsEntity } from 'src/global/entities/products.entity';
import { UserEntity } from 'src/global/entities/users.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoriesEntity,UserEntity,ProductsEntity]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, JwtService]
})
export class ProductsModule {}

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './tmp',
        // destination: './uploads/',
        filename: (req, file, cb) => {
          const filename: string = uuidv4();
          const ext: string = file.originalname.split('.').pop();
          cb(null, `${filename}.${ext}`);
        },
      }),
    }),
  ],
})
export class ImageUploadModule {}
 