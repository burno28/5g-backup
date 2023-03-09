import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminsEntity } from '../global/entities/admins.entity';
import { CategoriesEntity } from '../global/entities/categories.entity';
import { NoticesEntity } from '../global/entities/notices.entity';
import { ProductsEntity } from '../global/entities/products.entity';
import { UserEntity } from '../global/entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProductsEntity)
    private productRepository: Repository<ProductsEntity>,
    @InjectRepository(CategoriesEntity)
    private categoryRepository: Repository<CategoriesEntity>,
    @InjectRepository(AdminsEntity)
    private adminRepository: Repository<AdminsEntity>,
    @InjectRepository(NoticesEntity)
    private noticeRepository: Repository<NoticesEntity>,
  ) {}

  // 상품정보 가져오기 API
  async getProducts() {
    const products = await this.productRepository.find();
    if (products.length === 0) {
      throw new NotFoundException('상품이 존재하지 않습니다.');
    } else {
      return products;
    }
  }

  //상품정보 상세보기 API
  async getProductById(productId: number) {
    const product = await this.productRepository.findOne({
      where: { id: productId }
    });
    //새로추가 
    const sellerId = product.sellerId
    const seller = await this.userRepository.findOne({where: {id : sellerId}})
    const categoryId = product.categoryId
    const category = await this.categoryRepository.findOne({where: {id : categoryId}})
    //
    if (!product) {
      throw new NotFoundException('존재하지 않는 상품입니다.');
    } else {
      //return product ==> return {product, seller}
      return {product, seller, category};
    }
  }

  //상품 삭제 API
  async deleteProduct(productId: number) {
    this.productRepository.delete(productId);
    return { message: '상품이 삭제되었습니다' };
  }

  //회원정보 가져오기 API
  async getUsers() {
    const users = await this.userRepository.find();
    if (users.length === 0) {
      throw new NotFoundException('회원정보가 존재하지 않습니다.');
    } else {
      return users;
    }
  }

  //회원정보 상세보기 API
  async getUserById(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    } else {
      return user;
    }
  }

  //회원정보 수정(블랙리스트) API
  async banUser(userId: number, ban: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user){
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }
    else{
      const nickname = user.nickname;
      const banStatus = user.ban;

      if (ban === 1) {
      if (banStatus === 1) {
        throw new UnauthorizedException('이미 블랙리스트 처리된 유저입니다.');
      } else {
        await this.userRepository.update(userId, { ban });
        return { message: `${nickname}님이 블랙리스트 처리되었습니다.` };
      }
    } else if (ban === 0) {
      await this.userRepository.update(userId, { ban });
      return { message: `${nickname}님의 블랙리스트 처리가 취소되었습니다.` };
    }
  }
    
  }

  //회원 삭제 API
  async deleteUser(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    } else {
      const nickname = user.nickname;
      this.userRepository.delete(userId);
      return { message: `${nickname}님의 회원정보가 삭제되었습니다.` };
    }
  }

  //카테고리 조회 API
  async getCategory() {
    const categories = await this.categoryRepository.find();
    if (categories.length === 0) {
      throw new NotFoundException('카테고리가 없습니다.');
    } else {
      return categories;
    }
  }

  //카테고리 생성 API
  async createCategory(name: string) {
    if (name.length === 0) {
      throw new NotFoundException('내용이 비어있습니다.');
    } else {
      await this.categoryRepository.insert({ name });
      return { message: '카테고리가 추가되었습니다' };
    }
  }

  //카테고리 수정 API
  async updateCategory(categoryId: number, name: string) {
    if (name.length === 0) {
      throw new NotFoundException('내용이 비어있습니다.');
    } else {
      await this.categoryRepository.update(categoryId, { name });
      return { message: '카테고리가 수정되었습니다' };
    }
  }

  //카테고리 삭제 API
 async deleteCategory(categoryId: number) {
    this.categoryRepository.delete(categoryId);
    return { message: '카테고리가 삭제되었습니다' };
  }

  //공지사항 모두 조회

  async getNotices() {
    const notices = await this.noticeRepository.find();
    if (notices.length === 0) {
      throw new NotFoundException('공지사항이 없습니다.');
    } else {
      return notices;
    }
  }

  //공지사항 상세조회
  async getNoticeById(noticeId: number) {
    const notice = await this.noticeRepository.findOne({
      where: { id: noticeId },
    });
    if (!notice) {
      throw new NotFoundException('존재하지 않는 공지사항입니다.');
    } else {
      return notice;
    }
  }

  //공지사항 작성
  async createNotice(adminId: number, title: string, description: string) {
    const admin = await this.adminRepository.findOne({
      where: { id: adminId },
    });
    if (!admin) {
      throw new UnauthorizedException(
        '존재하지 않는 관리자입니다. 공지를 작성하실 수 없습니다.',
      );
    } else if (title.length === 0) {
      throw new NotFoundException('제목이 없습니다.');
    } else if (description.length === 0) {
      throw new NotFoundException('내용이 없습니다.');
    } else {
      this.noticeRepository.insert({ adminId, title, description });
      return { message: '새로운 공지가 작성되었습니다' };
    }
  }

  //공지사항 수정
  async updateNotice(noticeId: number, title: string, description: string) {
    if (title.length === 0) {
      throw new NotFoundException('제목이 없습니다.');
    } else if (description.length === 0) {
      throw new NotFoundException('내용이 없습니다.');
    } else {
      await this.noticeRepository.update(noticeId, { title, description });
      return { message: '공지가 수정되었습니다' };
    }
  }

  //공지사항 삭제
   async deleteNotice(noticeId: number) {
    this.noticeRepository.delete(noticeId);
    return { message: '공지가 삭제되었습니다' };
  }
}
