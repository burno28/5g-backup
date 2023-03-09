export class CreateProductDto {
  readonly title: string;
  readonly description: string;
  readonly price: number;
  readonly categoryId: number;
  readonly sellerId: number;
}