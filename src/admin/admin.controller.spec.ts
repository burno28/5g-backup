import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { BanUserDto } from './dto/ban-user.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminsEntity } from '../global/entities/admins.entity';
import { CategoriesEntity } from '../global/entities/categories.entity';
import { NoticesEntity } from '../global/entities/notices.entity';
import { ProductsEntity } from '../global/entities/products.entity';
import { UserEntity } from '../global/entities/users.entity';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';


describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService;
  let jwtService: JwtService;
  let userRepository: Repository<UserEntity>;
  let productRepository: Repository<ProductsEntity>;
  let categoryRepository: Repository<CategoriesEntity>;
  let adminRepository: Repository<AdminsEntity>;
  let noticeRepository: Repository<NoticesEntity>;

  beforeEach(async () => {
    const mockJwtService = { decode: () => ({ id: 1 }) };
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [AdminController],
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
        { provide: JwtService, useValue: mockJwtService }
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    productRepository = module.get<Repository<ProductsEntity>>(getRepositoryToken(ProductsEntity));
    categoryRepository = module.get<Repository<CategoriesEntity>>(getRepositoryToken(CategoriesEntity));
    adminRepository = module.get<Repository<AdminsEntity>>(getRepositoryToken(AdminsEntity));
    noticeRepository = module.get<Repository<NoticesEntity>>(getRepositoryToken(NoticesEntity));
  });

  //상품 

  describe('getProducts', () => {
    it('should return an array of products', async () => {
      const mockProducts = [new ProductsEntity(), new ProductsEntity()]
      jest.spyOn(service, 'getProducts').mockResolvedValueOnce(mockProducts);
      const result = await controller.getProducts();
      expect(result).toEqual({products: mockProducts});
    });
  });

  describe('getProductById', () => {
    it('should return a product with the given id', async () => {
      const mockProduct = new ProductsEntity()
      jest.spyOn(service, 'getProductById').mockResolvedValueOnce(mockProduct);

      const result = await controller.getProductById(1);
      expect(result).toEqual({product: mockProduct});
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product with the given id', async () => {
      const mockMessage =  {message: '상품이 삭제되었습니다'}
      jest.spyOn(service, 'deleteProduct').mockResolvedValueOnce(mockMessage)
      
      const result = await controller.deleteProduct(1);
      expect(result).toEqual(mockMessage);
    });
  });

  //회원

  describe('getUsers', () => {
    it('should return an array of users', async () => {
      const mockUsers = [new UserEntity(), new UserEntity()]
      jest.spyOn(service, 'getUsers').mockResolvedValueOnce(mockUsers);

      const result = await controller.getUsers();
      expect(result).toEqual({users: mockUsers});
    });
  });

  describe('getUserById', () => {
    it('should return an user with the given id', async () => {
      const mockUser = new UserEntity()
      mockUser.id = 1
      jest.spyOn(service, 'getUserById').mockResolvedValueOnce(mockUser);

      const result = await controller.getUserById(1);
      expect(result).toEqual({user: mockUser});
    });
  });

  describe('banUser', () => {
    const mockUser = new UserEntity();
    const nickname = mockUser.nickname
    mockUser.id = 1
    
    it('should ban a user successfully', async () => {
      const mockMessage =   { message: `${nickname}님이 블랙리스트 처리되었습니다.` }
      jest.spyOn(service, 'banUser').mockImplementation(async () => mockMessage)
      const data: BanUserDto = { ban: 1 }
      mockUser.ban = 0

      const result = await controller.banUser(1, data );
      expect(service.banUser).toHaveBeenCalledWith(1, data.ban)
      expect(result).toEqual(mockMessage);
    });

    it('should unban a user successfully', async () => {
      const mockMessage =   { message: `${nickname}님의 블랙리스트 처리가 취소되었습니다.` }
      jest.spyOn(service, 'banUser').mockImplementation(async () => mockMessage)
      const data: BanUserDto = { ban: 0 }
      mockUser.ban = 1

      const result = await controller.banUser(1, data );
      expect(service.banUser).toHaveBeenCalledWith(1, data.ban)
      expect(result).toEqual(mockMessage);
    });

    it('should throw an error if the user is already banned', async () => {
      const data: BanUserDto = { ban: 1 }
      mockUser.ban = 1

      const result = jest.spyOn(service, 'banUser').mockImplementation(async () => {throw new  UnauthorizedException('이미 블랙리스트 처리된 유저입니다.')})
      await expect(controller.banUser(1, data)).rejects.toThrow(UnauthorizedException);
      expect(result).toHaveBeenCalledWith(1, data.ban)
    });

    it('should throw an error if the user does not exist', async () => {
    const data: BanUserDto = { ban: 1 };
    mockUser.ban = 0
    const result = jest.spyOn(service, 'banUser').mockImplementation(() => {throw new NotFoundException('존재하지 않는 유저입니다.');});

    await expect(controller.banUser(2, data)).rejects.toThrow(NotFoundException);
    expect(result).toHaveBeenCalledWith(2, data.ban);
    });

  });

  describe('deleteUser', () => {
    it('should delete a notice with the given id', async () => {
      const mockUser = new UserEntity()
      const nickname = mockUser.nickname
      const mockMessage = { message: `${nickname}님의 회원정보가 삭제되었습니다.` }
      jest.spyOn(service, 'deleteUser').mockResolvedValueOnce(mockMessage)
      const result = await controller.deleteUser(1);
      expect(result).toEqual(mockMessage);
    });
  });


  //카테고리 

  describe('getCategory', () => {
    it('should return an array of categories', async () => {
      const mockcategory = [new CategoriesEntity(), new CategoriesEntity()]
      jest.spyOn(service, 'getCategory').mockResolvedValueOnce(mockcategory);

      const result = await controller.getCategory();
      expect(result).toEqual({category: mockcategory});
    });
  });


  describe('createCategory', () => {
    it('should create a category successfully', async () => {
      const mockmessage = { message: '카테고리가 추가되었습니다' }

      jest.spyOn(service, 'createCategory').mockResolvedValueOnce(mockmessage);
      const data: CreateCategoryDto = { name: "노트북"}
      const result = await controller.createCategory(data);

      expect(service.createCategory).toHaveBeenCalledWith(data.name);
      expect(result).toEqual(mockmessage);
    });

    it('should throw an error if the name does not exist', async () => {
      const data: CreateCategoryDto = { name: ""}
      const result = jest.spyOn(service, 'createCategory').mockImplementation(() => {throw new NotFoundException('내용이 비어있습니다.');});

    await expect(controller.createCategory(data)).rejects.toThrow(NotFoundException);
    expect(result).toHaveBeenCalledWith(data.name);
    });

  });

  describe('updateCategory', () => {
    it('should update a category successfully', async () => {
      const mockmessage = { message: '카테고리가 수정되었습니다' }
      jest.spyOn(service, 'updateCategory').mockResolvedValueOnce(mockmessage);
      const data: UpdateCategoryDto = { name: "노트북"}
      const result = await controller.updateCategory(1, data);

      expect(service.updateCategory).toHaveBeenCalledWith(1, data.name);
      expect(result).toEqual(mockmessage);
    });
    it('should throw an error if the name does not exist', async () => {
      const data: UpdateCategoryDto = { name: ""}
      const result = jest.spyOn(service, 'updateCategory').mockImplementation(() => {throw new NotFoundException('내용이 비어있습니다.');});

    await expect(controller.updateCategory(1, data)).rejects.toThrow(NotFoundException);
    expect(result).toHaveBeenCalledWith(1, data.name);

    });

  });

  describe('deleteCategory', () => {
    it('should delete a category with the given id', async () => {
      const mockMessage =  { message: '카테고리가 삭제되었습니다' }
      jest.spyOn(service, 'deleteCategory').mockResolvedValueOnce(mockMessage)
      
      const result = await controller.deleteCategory(1);
      expect(result).toEqual(mockMessage);
    });
  });




  //공지

  describe('getNotices', () => {
    it('should return an array of notices', async () => {
      const mockNotices = [new NoticesEntity(), new NoticesEntity()]
      jest.spyOn(service, 'getNotices').mockResolvedValueOnce(mockNotices);

      const result = await controller.getNotices();
      expect(result).toEqual({notices: mockNotices});
    });
  });

  describe('getNoticeById', () => {
    it('should return a notice with the given id', async () => {
      const mockNotice = new NoticesEntity()
      jest.spyOn(service, 'getNoticeById').mockResolvedValueOnce(mockNotice);

      const result = await controller.getNoticeById(1);
      expect(result).toEqual({notice: mockNotice});
    });
  });

  describe('createNotice', () => {
    it('should create a notice successfully', async () => {
      const mockmessage = { message: '새로운 공지가 작성되었습니다' }
      const data: CreateNoticeDto = { title: "test" , description:"this is test"}
      const mockJwt = 'mockJwtToken';
      const mockDecodedJwt = { id: 1 };
      const adminId = mockDecodedJwt.id

      jest.spyOn(service, 'createNotice').mockResolvedValue(mockmessage);
      jest.spyOn(jwtService, 'decode').mockReturnValue(mockDecodedJwt);
      const result = await controller.createNotice(data , mockJwt);

      expect(service.createNotice).toHaveBeenCalledWith(adminId, data.title, data.description);
      expect(result).toEqual(mockmessage);
    });

    it('should throw an error if the title does not exist', async () => {
      const data: CreateNoticeDto = { title: "" , description:"this is test"}
      const mockJwt = 'mockJwtToken';
      const mockDecodedJwt = { id: 1 };
      const adminId = mockDecodedJwt.id

      const spy = jest.spyOn(service, 'createNotice').mockImplementation(() => {throw new NotFoundException('제목이 없습니다.');});
      jest.spyOn(jwtService, 'decode').mockReturnValue(mockDecodedJwt);
      const result = controller.createNotice(data , mockJwt);

      expect(result).rejects.toThrow(NotFoundException);
      expect(spy).toHaveBeenCalledWith(adminId, data.title, data.description);

    });

    it('should throw an error if the description does not exist', async () => {
      const data: CreateNoticeDto = { title: "test" , description:""}
      const mockJwt = 'mockJwtToken';
      const mockDecodedJwt = { id: 1 };
      const adminId = mockDecodedJwt.id

      const spy = jest.spyOn(service, 'createNotice').mockImplementation(() => {throw new NotFoundException('내용이 없습니다.');});
      jest.spyOn(jwtService, 'decode').mockReturnValue(mockDecodedJwt);
      const result = controller.createNotice(data , mockJwt);

      expect(result).rejects.toThrow(NotFoundException);
      expect(spy).toHaveBeenCalledWith(adminId, data.title, data.description);
    })

  });


  describe('updateNotice', () => {
    it('should update a notice successfully', async () => {
      const mockmessage = { message: '공지가 수정되었습니다' }
      jest.spyOn(service, 'updateNotice').mockResolvedValue(mockmessage);

      const data: UpdateNoticeDto = { title: "test" , description:"this is test"}
      const result = await controller.updateNotice(1, data);

      expect(service.updateNotice).toHaveBeenCalledWith(1, data.title, data.description);
      expect(result).toEqual(mockmessage);
    });

    it('should throw an error if the title does not exist', async () => {
      const data: UpdateNoticeDto = { title: "" , description:"this is test"}
      const result = jest.spyOn(service, 'updateNotice').mockImplementation(() => {throw new NotFoundException('제목이 없습니다.');});

    await expect(controller.updateNotice(1, data)).rejects.toThrow(NotFoundException);
    expect(result).toHaveBeenCalledWith(1, data.title, data.description);

    });

    it('should throw an error if the description does not exist', async () => {
      const data: UpdateNoticeDto = { title: "test" , description:""}
      const result = jest.spyOn(service, 'updateNotice').mockImplementation(() => {throw new NotFoundException('내용이 없습니다.');});

    await expect(controller.updateNotice(1, data)).rejects.toThrow(NotFoundException);
    expect(result).toHaveBeenCalledWith(1, data.title, data.description);
    })

  });

  describe('deleteNotice', () => {
    it('should delete a notice with the given id', async () => {
      const mockMessage = { message: '공지가 삭제되었습니다' }
      jest.spyOn(service, 'deleteNotice').mockResolvedValueOnce(mockMessage)
      
      const result = await controller.deleteNotice(1);
      expect(result).toEqual(mockMessage);
    });
  });

});
