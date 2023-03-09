import { PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';

export interface JwtDecodeDto {
  [key: string]: string | number;
  id: number;
  email: string;
  nickname: string;
  iat: number;
  exp: number;
}
