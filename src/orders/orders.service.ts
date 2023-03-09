import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrdersEntity } from 'src/global/entities/orders.entity';
import { ProductsEntity } from 'src/global/entities/products.entity';
import { UserEntity } from 'src/global/entities/users.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrdersEntity)
    private orderRepository: Repository<OrdersEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProductsEntity)
    private productRepository: Repository<ProductsEntity>,
    private dataSource: DataSource,
  ) {}
  create(createOrderDto: CreateOrderDto) {
    return 'This action adds a new order';
  }

  async findMyPick(id: number) {
    try {
      const pick = await this.orderRepository.find({
        where: { buyerId: id, deleteAt: null },
        relations: ['product'],
      });
      console.log('22222333', pick);
      if (!pick.length) {
        throw new NotFoundException(
          `딜한 주문이 없거나 진행중인 상품이 없습니다.`,
        );
      }
      return pick;
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Return a response with a 404 status code
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: error.message,
          },
          HttpStatus.NOT_FOUND,
        );
      } else if (error instanceof UnauthorizedException) {
        // Return a response with a 401 status code
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: error.message,
          },
          HttpStatus.UNAUTHORIZED,
        );
      } else {
        // Return a generic response with a 500 status code
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Internal server error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async findMySell(id: number) {
    try {
      return await this.productRepository.find({
        where: { sellerId: id, status: 'sale' },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Return a response with a 404 status code
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: error.message,
          },
          HttpStatus.NOT_FOUND,
        );
      } else if (error instanceof UnauthorizedException) {
        // Return a response with a 401 status code
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: error.message,
          },
          HttpStatus.UNAUTHORIZED,
        );
      } else {
        // Return a generic response with a 500 status code
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Internal server error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async findMyProductsDealCheck(userId: number, productId: number) {
    try {
      const checkUser = await this.productRepository.findOne({
        where: {
          id: productId,
          sellerId: userId,
          status: 'sale',
        },
      });
      if (!checkUser) {
        throw new UnauthorizedException('당신의 물건이 아닙니다.');
      }
      const deal = await this.orderRepository.find({
        where: { productId, status: 'sale' },
      });
      if (!deal.length) {
        throw new NotFoundException(
          '상품에 제시된 딜이 없거나 이미 판매됬습니다.',
        );
      }
      return deal;
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Return a response with a 404 status code
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: error.message,
          },
          HttpStatus.NOT_FOUND,
        );
      } else if (error instanceof UnauthorizedException) {
        // Return a response with a 401 status code
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: error.message,
          },
          HttpStatus.UNAUTHORIZED,
        );
      } else {
        // Return a generic response with a 500 status code
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Internal server error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
  async buyResult(userId: number, orderId: number) {
    try {
      const order = await this.orderRepository.findOne({
        where: { id: orderId, deleteAt: null },
      });
      if (!order) {
        throw new NotFoundException('해당되는 주문이 없습니다.');
      }
      if (order.buyerId !== Number(userId)) {
        throw new UnauthorizedException('내가 구매한 상품이 아닙니다.');
      }
      if (order.status === 'sale') {
        throw new UnauthorizedException('아직 선택되지 않았습니다.');
      }
      if (order.status === 'sold') {
        throw new UnauthorizedException('판매자가 다른 제안을 수락했습니다.');
      }
      const sellerInfo = await this.productRepository.findOne({
        where: { id: order.productId },
      });
      const sellerUser = await this.userRepository.findOne({
        where: { id: sellerInfo.id },
        select: ['id', 'email', 'nickname'],
      });
      return sellerUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Return a response with a 404 status code
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: error.message,
          },
          HttpStatus.NOT_FOUND,
        );
      } else if (error instanceof UnauthorizedException) {
        // Return a response with a 401 status code
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: error.message,
          },
          HttpStatus.UNAUTHORIZED,
        );
      } else {
        // Return a generic response with a 500 status code
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Internal server error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async sellResult(userId: number, orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, status: 'success', deleteAt: null },
    });
    try {
      if (!order) {
        throw new NotFoundException('선택하신 주문이 없습니다.');
      }
      const sellUser = await this.productRepository.find({
        where: { id: order.productId, sellerId: userId, status: 'success' },
      });
      if (!sellUser) {
        throw new UnauthorizedException('내가 판매하는 물품이 아닙니다.');
      }
      const buyerInfo = await this.userRepository.findOne({
        where: { id: order.buyerId },
        select: ['id', 'email', 'nickname'],
      });
      return buyerInfo;
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Return a response with a 404 status code
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: error.message,
          },
          HttpStatus.NOT_FOUND,
        );
      } else if (error instanceof UnauthorizedException) {
        // Return a response with a 401 status code
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: error.message,
          },
          HttpStatus.UNAUTHORIZED,
        );
      } else {
        // Return a generic response with a 500 status code
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Internal server error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async getBuyList(userId: number) {
    const buyList = await this.orderRepository.find({
      where: { buyerId: userId, status: 'success', deleteAt: null },
      relations: ['product'],
    });
    try {
      if (!buyList.length) {
        throw new NotFoundException(`${userId}는 구매한 상품이 없습니다.`);
      }
      return buyList;
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Return a response with a 404 status code
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: error.message,
          },
          HttpStatus.NOT_FOUND,
        );
      } else if (error instanceof UnauthorizedException) {
        // Return a response with a 401 status code
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: error.message,
          },
          HttpStatus.UNAUTHORIZED,
        );
      } else {
        // Return a generic response with a 500 status code
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Internal server error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
  async getSellList(userId: number) {
    const myProduct = await this.productRepository.find({
      where: { sellerId: userId, status: 'success' },
      select: ['id'],
    });
    try {
      if (!myProduct.length) {
        throw new NotFoundException('판매하기 위해서 등록한 상품이 없습니다.');
      }
      for (let i = 0; i < myProduct.length; i++) {
        const real = await this.orderRepository.find({
          where: { productId: myProduct[i].id, status: 'success' },
          relations: ['product'],
        });
        console.log('판매 성공', real);
        if (!real.length) {
          throw new NotFoundException('판매를 성공한 상품이 없습니다.');
        }
        return real;
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Return a response with a 404 status code
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: error.message,
          },
          HttpStatus.NOT_FOUND,
        );
      } else if (error instanceof UnauthorizedException) {
        // Return a response with a 401 status code
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: error.message,
          },
          HttpStatus.UNAUTHORIZED,
        );
      } else {
        // Return a generic response with a 500 status code
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Internal server error',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
  async putdealAccept(userId: number, orderId: number) {
    const selectOrder = await this.orderRepository.findOne({
      where: { id: orderId, status: 'sale', deleteAt: null },
    });
    if (!selectOrder) {
      throw new NotFoundException(`${orderId}는 구매할 수 없는 주문입니다.`);
    }
    const product = await this.productRepository.findOne({
      where: { id: selectOrder.productId, sellerId: userId, status: 'success' },
    });
    if (!product) {
      throw new UnauthorizedException('내가 판매하는 상품이 아닙니다.');
    }
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.orderRepository.update({ id: orderId }, { status: 'success' });
      await this.orderRepository.update(
        { productId: selectOrder.productId, status: 'sale' },
        { status: 'sold' },
      );
      await this.productRepository.update(
        { id: selectOrder.productId },
        { status: 'success' },
      );
    } catch (e) {
      console.log(e);
      await queryRunner.rollbackTransaction();
      console.log(e);
    } finally {
      await queryRunner.release();
    }
  }
  async postPriceDeal(userId: number, productId: number, data: number) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('상품 정보가 없습니다.');
    }
    if (product.sellerId === Number(userId)) {
      throw new UnauthorizedException('자신의 상품에는 deal을 할 수 없습니다.');
    }
    const user = await this.orderRepository.findOne({
      where: { productId: productId, buyerId: userId, deleteAt: null },
    });
    if (user) {
      throw new UnauthorizedException(
        '이미 제시했습니다. 수정하기 버튼을 눌러주세요.',
      );
    }
    await this.orderRepository.insert({
      productId: productId,
      buyerId: userId,
      deal: data,
    });
    return { message: '가격 제시 완료' };
  }
  async changeDeal(userId: number, orderId: number, data: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, deleteAt: null },
    });

    if (!order) {
      throw new NotFoundException('해당 요청을 찾을수 없습니당');
    }
    if (order.buyerId !== Number(userId)) {
      throw new UnauthorizedException('해당 상품이 없습니다.');
    }
    if (data > 1000000000) {
      throw new UnauthorizedException('장난치지 마세요');
    }
    await this.orderRepository.update({ id: orderId }, { deal: data });
  }

  // -----------------------------
  // test
  async pl() {
    return await this.productRepository.find({
      relations: ['seller'],
    });
  }
}
