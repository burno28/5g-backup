import _ from 'lodash';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DeleteProductDto } from './dto/delete-product.dto';
import { ProductsEntity } from 'src/global/entities/products.entity';
import { CategoriesEntity } from 'src/global/entities/categories.entity';
import { UserEntity } from 'src/global/entities/users.entity';
import { DataSource, FindOperator, Repository } from 'typeorm';
import { ProductImagesEntity } from 'src/global/entities/productimages.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductsEntity)
    private productRepository: Repository<ProductsEntity>,
    @InjectRepository(CategoriesEntity)
    private categoriesRepository: Repository<CategoriesEntity>,
    @InjectRepository(UserEntity)
    private userEntity: Repository<UserEntity>,
    // @InjectRepository(ProductImagesEntity)
    // private ProductImagesEntity: Repository<ProductImagesEntity>
  ) {}
  //사진은 아직 안함, crud먼저
  async getProducts() {
    return await this.productRepository.find({
      where: { status: 'sale' },
      select: [
        'id',
        'title',
        'price',
        'viewCount',
        'likes',
        'createdAt',
      ]
      //sellerId-닉네임, 이메일, 주소/ 카테고리아이디추가-name도 추가로 보냄
    }); //셀러아이디에 조인되는 닉네임 뿌려야//서버부담때문에 안하기로함
  }

  //status: 'sale' 를 status: sale로 바꿔라
  async getProductById(id: number) {
    const product = await this.productRepository.findOne({
      where: { id: id, status: 'sale' },
      select: ['id','title','description','price','sellerId','categoryId','viewCount','likes','createdAt',
      ],
      relations: ['category', 'seller'],
    });

    if (!product) {// product가 null인 경우 예외 처리
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    const {category: { name },seller: { nickname }} = product; 
    // 카테고리 ID와 이름, 판매자 닉네임 얻기

    return {
      product: {
        ...product, // 기존 product 속성 복사
        category: { name }, // name 속성만 가진 category 객체 추가
        seller: { nickname }, // nickname 속성만 가진 seller 객체 추가
      },
    }; //주소추가
  }
  //사진은 아직 안함, crud먼저//뭐 더 들어가야함? 모름

  //상품드록, 이미지 여기도 넣어야한다
  async createProduct(
    title: string,
    description: string,
    price: number,
    categoryId: number,
    sellerId: number,
  ) {
    const user = await this.userEntity.findOne({where:{id: sellerId} });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const category = await this.categoriesRepository.findOne({where:{ id: categoryId }});
    if (!category) {
      throw new NotFoundException('Category not found');
    }
  
    const product = new ProductsEntity();
    product.title = title;
    product.description = description;
    product.price = price;
    product.category = category;
    product.seller = user;
  
    return await this.productRepository.save({
      title, 
      description, 
      price, 
      category, 
      sellerId});
  }


  //얘도 이미지
  async updateProduct(
    id: number,
    title: string,
    description: string,
    price: number,
    categoryId: number,
    sellerId: number,
  ) {
    await this.verifySomething(id, sellerId);

    this.productRepository.update(id, {
      title,
      description,
      price,
      categoryId,
    });
  }
  async deleteProduct(
    id: number,
    sellerId: number,
    ) {
    await this.verifySomething(id, sellerId);

    this.productRepository.update(id, {
      status: 'soldout'});
  }

  async verifySomething(id: number, sellerId: number) {
    const product = await this.productRepository.findOne({
      where: { id: id, status: 'sale' },
      select: ['sellerId'],
    });

    if (product == null) {
      throw new NotFoundException(
        `찾으시는 판매글이 없습니다 sellerId: ${sellerId}님`,
      );
    }
    if (product.sellerId !== sellerId) {
      throw new UnauthorizedException(
        `sellerId: ${sellerId}님의 판매글이 아닙니다`,
      );
    }
  } 


}
