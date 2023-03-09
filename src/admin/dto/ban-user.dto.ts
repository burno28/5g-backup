import { IsNumber } from 'class-validator';

export class BanUserDto {
  @IsNumber()
  readonly ban: number;
}