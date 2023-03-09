import {
  Body,
  Controller,
  Get,
  Param,
  HttpCode,
  Post,
  Query,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../global/common/decorator/skip-auth.decorator';
import { UserEntity } from '../global/entities/users.entity';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { Response } from 'express';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
interface IOAuthUser {
  //interface 설정
  user: {
    name: string;
    email: string;
    password: string;
  };
}
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly userService: UserService,
    private configService: ConfigService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  //이제 Nest 기본 응답 개체와 상호 작용할 수 있지만 (예: 특정 조건에 따라 쿠키 또는 헤더 설정) 나머지는 프레임워크에 맡김
  async login(@Req() req, @Res({ passthrough: true }) res: Response) {
    const user = req.user;
    const { accessToken, ...accessOption } =
      this.authService.getCookieWithJwtAccessToken(user);
    // console.log(accessOption);
    const { refreshToken, ...refreshOption } =
      this.authService.getCookieWithJwtRefreshToken(user.id);
    await this.userService.setCurrentRefreshToken(refreshToken, user.id);
    res.cookie('Authentication', accessToken, accessOption);
    res.cookie('refreshToken', refreshToken, refreshOption);
    return user;
  }

  // @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  async logOut(@Req() req, @Res({ passthrough: true }) res: Response) {
    const { accessOption, refreshOption } =
      this.authService.getCookiesForLogOut();
    await this.userService.removeRefreshToken(req.user.id);
    res.cookie('Authentication', '', accessOption);
    res.cookie('refreshToken', '', refreshOption);
  }

  @Public()
  @Post('signup')
  async register(@Body() user: UserEntity): Promise<any> {
    return this.authService.register(user);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
    const user = req.user;
    const { accessToken, ...accessOption } =
      this.authService.getCookieWithJwtAccessToken(user);
    res.cookie('Authentication', accessToken, accessOption);
    return user;
  }
}
