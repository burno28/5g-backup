import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Render} from '@nestjs/common';
import { AdminAuthGuard } from '../admin-auth/guards/admin-auth.guards';
import { Public } from '../global/common/decorator/skip-auth.decorator';
import { AdminService } from './admin.service';
import { BanUserDto } from './dto/ban-user.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { JwtService } from '@nestjs/jwt';
import { AdminCookies } from './decorator/find-cookie.decorator';


@Controller()
@Public()
@UseGuards(AdminAuthGuard)

export class AdminController {

    constructor(private readonly adminService: AdminService,
        private jwtService: JwtService) {}
  // 상품정보 가져오기 API
  @Get('/products')
  @Render('admin-products.ejs')
  async getProducts(
    
  ) {
    return {products : await this.adminService.getProducts()}
  }

  //상품정보 상세보기 API
  @Get('/products/:productId')
  @Render('admin-productById.ejs')
  async getProductById(@Param('productId') productId: number) {
    // 원래: return await this.adminService.getProductById(productId)
  const result = await this.adminService.getProductById(productId)
  const product = result.product
  const seller = result.seller
  const category = result.category
    return {product, seller, category}
  }

  //상품 삭제 API
  @Delete('/products/:productId')
  deleteProduct(@Param('productId') productId: number) {
    return this.adminService.deleteProduct(productId);
  }

  //회원정보 가져오기 API
  @Get('/users')
  @Render('admin-users.ejs')
  async getUsers() {
    return {users: await this.adminService.getUsers()} 
  }

  //회원정보 상세보기 API
  @Get('/users/:userId')
  @Render('admin-userById.ejs')
  async getUserById(@Param('userId') userId: number) {
    return {user: await this.adminService.getUserById(userId)}
  }

  //회원정보 수정(블랙리스트) API
  @Put('/users/:userId')
  async banUser(@Param('userId') userId: number, @Body() data: BanUserDto) {
    return await this.adminService.banUser(userId, data.ban);
  }

  //회원 삭제 API
  @Delete('/users/:userId')
  async deleteUser(@Param('userId') userId: number) {
    return await this.adminService.deleteUser(userId);
  }

  //카테고리 조회 API
  @Get('/category')
  @Render('admin-category.ejs')
  async getCategory() {
    return {category: await this.adminService.getCategory()} 
  }

  //카테고리 생성 API
  @Get('/post/category')
  @Render('admin-categoryPost.ejs')
  async viewCategory(){
    return {message: "카테고리 작성 페이지"}
  }

  @Post('/category')
  async createCategory(@Body() data: CreateCategoryDto) {
    return await this.adminService.createCategory(data.name);
  }

  //카테고리 수정 API
  @Put('/category/:id')
  async updateCategory(
    @Param('id') categoryId: number,
    @Body() data: UpdateCategoryDto,
  ) {
    return await this.adminService.updateCategory(categoryId, data.name);
  }

  //카테고리 삭제 API
  @Delete('/category/:id')
  deleteCategory(@Param('id') categoryId: number) {
    return this.adminService.deleteCategory(categoryId);
  }

  //공지사항 모두 조회

  @Get('/notice')
  @Render('admin-notices.ejs')
  async getNotices() {
    return {notices: await this.adminService.getNotices()}
  }

  //공지사항 상세조회

  @Get('/notice/:noticeId')
  @Render('admin-noticeById.ejs')
  async getNoticeById(@Param('noticeId') noticeId: number) {
    return {notice: await this.adminService.getNoticeById(noticeId)}
  }

  //공지사항 작성
  @Get('/post/notice')
  @Render('admin-noticePost.ejs')
  async viewNotice(){
    return {message: "공지작성 페이지"}
  }
  @Post('/notice')
  async createNotice(
    @Body() data:CreateNoticeDto,
    @AdminCookies('accessToken') jwt: string,
){
  const decodeToken = this.jwtService.decode(jwt, { json: true }) as { id:number }
  const adminId = decodeToken.id

    return await this.adminService.createNotice(adminId, data.title, data.description);
}


  //공지사항 수정
  @Put('/notice/:noticeId')
  async updateNotice(
    @Param('noticeId') noticeId: number,
    @Body() data: UpdateNoticeDto,
  ) {
    return await this.adminService.updateNotice(
      noticeId,
      data.title,
      data.description,
    );
  }

  //공지사항 삭제
  @Delete('/notice/:noticeId')
  deleteNotice(@Param('noticeId') noticeId: number) {
    return this.adminService.deleteNotice(noticeId);
  }
}
