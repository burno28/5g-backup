import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Render,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DeleteProductDto } from './dto/delete-product.dto';
import { Public } from 'src/global/common/decorator/skip-auth.decorator';
import { Cookies } from 'src/global/common/decorator/find-cookie.decorator';
import { JwtDecodeDto } from 'src/orders/dto/jwtdecode-order.dto';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('productss')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  //상품목록조회
  @Public()
  @Get('/')
  getProducts() {
    return this.productsService.getProducts();
  }
  //상품 상세 생성
  @Public()
  @Get('/:productId')
  findProduct(@Param('productId') productId: number) {
    return this.productsService.getProductById(productId);
  }
  //상품등록
  
  @UseGuards(JwtAuthGuard)
  @Post('/')
  @Render('order-mySellProduct.ejs')
  createProduct(
    @Cookies('Authentication') jwt: JwtDecodeDto,
    @Body() data: CreateProductDto,
    // @UploadedFiles() images: Array<Express.Multer.File>,
  ) {
    if (!jwt || !jwt.id) {
      throw new BadRequestException('Invalid JWT');
    }
    const userId = jwt.id;
    return this.productsService.createProduct(
      data.title,
      data.description,
      data.price,
      data.categoryId,
      userId,
    );
  }
  //상품수정
  @UseGuards(JwtAuthGuard)
  @Put('/:productId')
  updateProduct(
    @Cookies('Authentication') jwt: JwtDecodeDto,
    @Param('productId') productId: number,
    @Body() data: UpdateProductDto,
  ) {
    if (!jwt || !jwt.id) {
      throw new BadRequestException('Invalid JWT');
    }
    const userId = jwt.id;
    return this.productsService.updateProduct(
      productId,
      data.title,
      data.description,
      data.price,
      data.categoryId,
      userId, 
    );
  }
 
  //상품삭제
  @UseGuards(JwtAuthGuard)
  @Delete('/:productId')
  deleteProduct(    
    @Cookies('Authentication') jwt: JwtDecodeDto,
    @Param('productId') productId: number,
    @Body() data: DeleteProductDto
    ) {
      if (!jwt || !jwt.id) {
        throw new BadRequestException('Invalid JWT');
      }

    return this.productsService.deleteProduct(productId,jwt.id,);
  }
  //상품 좋아요
  //@Post('products/:productId')
}



