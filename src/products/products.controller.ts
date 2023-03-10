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
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

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
  @Render('products-upload.ejs')
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
    @Body() data: DeleteProductDto,
  ) {
    if (!jwt || !jwt.id) {
      throw new BadRequestException('Invalid JWT');
    }

    return this.productsService.deleteProduct(productId, jwt.id);
  }
  //상품 좋아요
  //@Post('products/:productId')

  @Public()
  @Post('image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './tmp',
        filename: (req, file, cb) => {
          const filename: string = uuidv4();
          const ext: string = file.originalname.split('.').pop();
          cb(null, `${filename}.${ext}`);
          console.log('tmp 이미지 이름 로그', filename);
        },
      }),

      fileFilter: (req, file, cb) => {

        try {
          if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            req.fileValidationError = 'Only image files are allowed!';
            console.log('이미지가 아닌',file.originalname,'이 제거됨');
            return cb(new BadRequestException('Only image files are allowed!'), false);
          }
          cb(null, true);
        } catch (error) {
          cb(error, false);
        }
      },
    }),
  )
  async uploadImage(@UploadedFile() file) {
    console.log('이미지?', file);
    // 파일 저장 로직
    const { path, filename } = file;
    const fileStream = fs.createReadStream(path);
    const writeStream = fs.createWriteStream(`./uploads/${filename}`);
    await fileStream.pipe(writeStream);
    // 임시 폴더에서 파일 삭제
    await fs.promises.unlink(path);
    console.log(`${path} is deleted!`);
  }
}
