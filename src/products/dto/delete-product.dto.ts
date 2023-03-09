// import { PickType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

export class DeleteProductDto{
  readonly sellerId: number;
  readonly productId: number;
  readonly status: string;

} 
