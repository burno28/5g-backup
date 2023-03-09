import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminService } from './admin.service';
import { AdminsEntity } from '../global/entities/admins.entity';
import { CategoriesEntity } from '../global/entities/categories.entity';
import { NoticesEntity } from '../global/entities/notices.entity';
import { ProductsEntity } from '../global/entities/products.entity';
import { UserEntity } from '../global/entities/users.entity';

describe('AdminService', () => {
  let adminService: AdminService;
  let userRepository: Repository<UserEntity>;
  let productRepository: Repository<ProductsEntity>;
  let categoryRepository: Repository<CategoriesEntity>;
  let adminRepository: Repository<AdminsEntity>;
  let noticeRepository: Repository<NoticesEntity>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ProductsEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(CategoriesEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(AdminsEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(NoticesEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    adminService = moduleRef.get<AdminService>(AdminService);
    userRepository = moduleRef.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    productRepository = moduleRef.get<Repository<ProductsEntity>>(getRepositoryToken(ProductsEntity));
    categoryRepository = moduleRef.get<Repository<CategoriesEntity>>(getRepositoryToken(CategoriesEntity));
    adminRepository = moduleRef.get<Repository<AdminsEntity>>(getRepositoryToken(AdminsEntity));
    noticeRepository = moduleRef.get<Repository<NoticesEntity>>(getRepositoryToken(NoticesEntity));
  });

  //상품 
  describe('getProducts', () => {
    it('should return an array of products', async () => {
      const mockProducts = [new ProductsEntity(), new ProductsEntity()];
      jest.spyOn(productRepository, 'find').mockResolvedValueOnce(mockProducts);

      const result = await adminService.getProducts();
      expect(productRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProducts);
    });

    it('should throw a NotFoundException when no products are found', async () => {
      jest.spyOn(productRepository, 'find').mockResolvedValueOnce([]);

      await expect(adminService.getProducts()).rejects.toThrowError(NotFoundException);
      expect(productRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('getProductById', () => {
    it('should return a product when given a valid id', async () => {
      const mockProduct = new ProductsEntity();
      jest.spyOn(productRepository, 'findOne').mockResolvedValueOnce(mockProduct);

      const result = await adminService.getProductById(1);
      expect(productRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockProduct);
    });

    it('should throw a NotFoundException when given an invalid id', async () => {
      jest.spyOn(productRepository, 'findOne').mockResolvedValueOnce(undefined);

      await expect(adminService.getProductById(1)).rejects.toThrowError(NotFoundException);
      expect(productRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('deleteProduct', () => {

    it('should delete a product when given a valid id', async () => {
      const mockMessage = { message: '상품이 삭제되었습니다' }
      jest.spyOn(productRepository, 'delete').mockResolvedValueOnce(undefined)

      const result = await adminService.deleteProduct(1);
      expect(productRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockMessage);
    });
  });

  //회원

  describe('getUsers', () => {
    it('should return an array of users', async () => {
      const mockUsers = [new UserEntity(), new UserEntity()];
      jest.spyOn(userRepository, 'find').mockResolvedValueOnce(mockUsers);

      const result = await adminService.getUsers();
      expect(userRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUsers);
    });

    it('should throw a NotFoundException when no users are found', async () => {
      jest.spyOn(userRepository, 'find').mockResolvedValueOnce([]);

      await expect(adminService.getUsers()).rejects.toThrowError(NotFoundException);
      expect(userRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserById', () => {
    it('should return am user when given a valid id', async () => {
      const mockUser = new UserEntity();
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);

      const result = await adminService.getUserById(1);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockUser);
    });

    it('should throw a NotFoundException when given an invalid id', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(undefined);

      await expect(adminService.getUserById(1)).rejects.toThrowError(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('banUser', () => {

    const mockUser = new UserEntity();
    mockUser.nickname = 'mockUser';

    it('should ban a user successfully', async () => {
      mockUser.ban = 0
      mockUser.id = 1
      let nickname = mockUser.nickname
      const mockmessage = { message: `${nickname}님이 블랙리스트 처리되었습니다.` }
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'update').mockResolvedValue(undefined);

      const userId = 1
      const ban = 1

      const result = await adminService.banUser(userId, ban);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(userRepository.update).toHaveBeenCalledWith(1, { ban: 1 });
      expect(result).toEqual(mockmessage);

    });

    it('should unban a user successfully', async () => {
      mockUser.ban = 1
      mockUser.id = 1
      let nickname = mockUser.nickname
      const mockmessage = { message: `${nickname}님의 블랙리스트 처리가 취소되었습니다.` }
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'update').mockResolvedValue(undefined);

      const userId = 1
      const ban = 0

      const result = await adminService.banUser(userId, ban);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(userRepository.update).toHaveBeenCalledWith(1, { ban: 0 });
      expect(result).toEqual(mockmessage);

    });

    it('should throw an error if the user is already banned', async () => {
      mockUser.ban = 1
      mockUser.id = 1
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser)
      const userId = 1
      const ban = 1

      await expect(adminService.banUser(userId, ban)).rejects.toThrowError(UnauthorizedException);
    });

    it('should throw an error if the user does not exist', async () => {
      mockUser.id = 1
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(undefined);

      await expect(adminService.banUser(3, 1)).rejects.toThrowError(NotFoundException);
    });

});


  describe('deleteUser', () => {

    it('should delete an user when given a valid id', async () => {
      const mockUser = new UserEntity();
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);
      let nickname = mockUser.nickname
      const mockMessage = { message: `${nickname}님의 회원정보가 삭제되었습니다.` }
      jest.spyOn(userRepository, 'delete').mockResolvedValueOnce(undefined)

      const result = await adminService.deleteUser(1);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(userRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockMessage);
    });
  });

  //카테고리 

  describe('getCategory', () => {
    it('should return an array of categories', async () => {
      const mockcategory = [new CategoriesEntity(), new CategoriesEntity()];
      jest.spyOn(categoryRepository, 'find').mockResolvedValueOnce(mockcategory);

      const result = await adminService.getCategory();
      expect(categoryRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockcategory);
    });

    it('should throw a NotFoundException when no categories are found', async () => {
      jest.spyOn(categoryRepository, 'find').mockResolvedValueOnce([]);

      await expect(adminService.getCategory()).rejects.toThrowError(NotFoundException);
      expect(categoryRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('createCategory', () => {
    it('should create a category successfully', async () => {
      const mockmessage = { message: '카테고리가 추가되었습니다' }

      jest.spyOn(categoryRepository, 'insert').mockResolvedValue(undefined);

      const name = "노트북"
      const result = await adminService.createCategory(name);

      expect(categoryRepository.insert).toHaveBeenCalledWith({ name });
      expect(result).toEqual(mockmessage);
    });

    it('should throw an error if the name does not exist', async () => {
      const name = ""
      jest.spyOn(categoryRepository, 'insert').mockResolvedValue(undefined);
      await expect(adminService.createCategory(name)).rejects.toThrowError(NotFoundException);
    });

  });

  describe('updateCategory', () => {
    it('should update a category successfully', async () => {
      const mockmessage = { message: '카테고리가 수정되었습니다' }
      jest.spyOn(categoryRepository, 'update').mockResolvedValue(undefined);

      const name = "노트북"
      const result = await adminService.updateCategory(1, name);

      expect(categoryRepository.update).toHaveBeenCalledWith(1, { name });
      expect(result).toEqual(mockmessage);
    });

    it('should throw an error if the name does not exist', async () => {
      const name = ""
      jest.spyOn(categoryRepository, 'update').mockResolvedValue(undefined);
      await expect(adminService.updateCategory(1, name)).rejects.toThrowError(NotFoundException);
    });

  });

  describe('deleteCategory', () => {
    it('should delete a category when given a valid id', async () => {
      const mockMessage = { message: '카테고리가 삭제되었습니다' }
      jest.spyOn(categoryRepository, 'delete').mockResolvedValueOnce(undefined)
      const result = await adminService.deleteCategory(1);
      expect(categoryRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockMessage);
    });
  });

  //공지사항 

  describe('getNotices', () => {
    it('should return an array of notices', async () => {
      const mockNotices = [new NoticesEntity(), new NoticesEntity()];
      jest.spyOn(noticeRepository, 'find').mockResolvedValueOnce(mockNotices);

      const result = await adminService.getNotices();
      expect(noticeRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockNotices);
    });

    it('should throw a NotFoundException when no users are found', async () => {
      jest.spyOn(noticeRepository, 'find').mockResolvedValueOnce([]);

      await expect(adminService.getNotices()).rejects.toThrowError(NotFoundException);
      expect(noticeRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('getNoticeById', () => {
    it('should return a notice when given a valid id', async () => {
      const mocknotice = new NoticesEntity();
      jest.spyOn(noticeRepository, 'findOne').mockResolvedValueOnce(mocknotice);

      const result = await adminService.getNoticeById(1);
      expect(noticeRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mocknotice);
    });

    it('should throw a NotFoundException when given an invalid id', async () => {
      jest.spyOn(noticeRepository, 'findOne').mockResolvedValueOnce(undefined);

      await expect(adminService.getNoticeById(1)).rejects.toThrowError(NotFoundException);
      expect(noticeRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('createNotice', () => {
    const mockAdmin = new AdminsEntity();
    mockAdmin.id = 1
    it('should create a notice successfully', async () => {
      const mockmessage = { message: '새로운 공지가 작성되었습니다' }
      jest.spyOn(adminRepository, 'findOne').mockResolvedValue(mockAdmin);
      jest.spyOn(noticeRepository, 'insert').mockResolvedValue(undefined);

      const adminId = mockAdmin.id
      const title = "test"
      const description = "this is test"
      const result = await adminService.createNotice(adminId, title, description);

      expect(adminRepository.findOne).toHaveBeenCalledWith({ where: { id: adminId } });
      expect(noticeRepository.insert).toHaveBeenCalledWith({adminId, title, description });
      expect(result).toEqual(mockmessage);
    });

    it('should throw an error if the title does not exist', async () => {
      const adminId = mockAdmin.id
      const title = ""
      const description = "this is test"
      jest.spyOn(adminRepository, 'findOne').mockResolvedValue(mockAdmin);
      jest.spyOn(noticeRepository, 'insert').mockResolvedValue(undefined);

      await expect(adminService.createNotice(adminId, title, description)).rejects.toThrowError(NotFoundException);
    });

    it('should throw an error if the description does not exist', async () => {
      const adminId = mockAdmin.id
      const title = "test"
      const description = ""
      jest.spyOn(adminRepository, 'findOne').mockResolvedValue(mockAdmin);
      jest.spyOn(noticeRepository, 'insert').mockResolvedValue(undefined);

      await expect(adminService.createNotice(adminId, title, description)).rejects.toThrowError(NotFoundException);
    })

    it('should throw a UnauthorizedException when given an invalid id', async () => {
    
      const title = "test"
      const description = "this is test"

      jest.spyOn(adminRepository, 'findOne').mockResolvedValue(undefined);
      await expect(adminService.createNotice(3, title, description)).rejects.toThrowError(UnauthorizedException);
    })

  });


  describe('updateNotice', () => {
    it('should update a notice successfully', async () => {
      const mockmessage = { message: '공지가 수정되었습니다' }
      jest.spyOn(noticeRepository, 'update').mockResolvedValue(undefined);

      const title = "test"
      const description = "this is test"
      const result = await adminService.updateNotice(1, title, description);

      expect(noticeRepository.update).toHaveBeenCalledWith(1, { title, description });
      expect(result).toEqual(mockmessage);
    });

    it('should throw an error if the title does not exist', async () => {
      const title = ""
      const description = "this is test"
      jest.spyOn(noticeRepository, 'update').mockResolvedValue(undefined);
      await expect(adminService.updateNotice(1, title, description)).rejects.toThrowError(NotFoundException);

    });

    it('should throw an error if the description does not exist', async () => {
      const title = "test"
      const description = ""
      jest.spyOn(noticeRepository, 'update').mockResolvedValue(undefined);
      await expect(adminService.updateNotice(1, title, description)).rejects.toThrowError(NotFoundException);
    })

  });

  describe('deleteNotice', () => {

    it('should delete a notice when given a valid id', async () => {
      const mockMessage = { message: '공지가 삭제되었습니다' }
      jest.spyOn(noticeRepository, 'delete').mockResolvedValueOnce(undefined)
      const result = await adminService.deleteNotice(1);
      expect(noticeRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockMessage);
    });
  });
  
});
