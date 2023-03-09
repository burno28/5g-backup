import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { LoginAdminDto } from '../admin/dto/login-admin.dto';
import { AdminAuthService } from './admin-auth.service';
import { Request, Response } from 'express';
import { Public } from '../global/common/decorator/skip-auth.decorator';

@Controller('admin')

@Public()
export class AdminAuthController {

    constructor(private readonly adminAuthService: AdminAuthService) {}

    //admin 로그인
@Post('/login')
async login(
    @Body() adminDto: LoginAdminDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const jwt = await this.adminAuthService.login(adminDto);
    const {accessToken, message, ...accessOption} = jwt
    res.setHeader('Authorization', 'Bearer ' + accessToken);
    res.cookie('accessToken', accessToken, accessOption);
    return message;
  }

  //admin 로그아웃 
@Post('/logout')
async logOut(@Req() req, @Res({ passthrough: true }) res: Response) {
  const { accessOption, message } = await this.adminAuthService.logOut();
  res.cookie('accessToken', '', accessOption);
  return message
}

}