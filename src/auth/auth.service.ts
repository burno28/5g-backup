import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../global/entities/users.entity';
import * as jwt from 'jsonwebtoken';
import { HttpService } from '@nestjs/axios';
import { CreateUserDto } from 'src/user/dto';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async vaildateUser(email: string, plainTextPassword: string): Promise<any> {
    try {
      const user = await this.userService.getByEmail(email);
      await this.verifyPassword(plainTextPassword, user.password);
      const { password, ...result } = user;
      return result;
    } catch (error) {
      throw new HttpException('잘못된 요청입니다.', HttpStatus.BAD_REQUEST);
    }
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatch = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatch) {
      throw new HttpException(
        '비밀번호가 일치하지 않습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async register(user: UserEntity) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    try {
      const { password, ...returnUser } = await this.userService.create({
        ...user,
        password: hashedPassword,
      });
      return returnUser;
    } catch (error) {
      if (error?.code === 'ER_DUP_ENTRY') {
        throw new HttpException(
          '유저가 이미 존재합니다.',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  getCookieWithJwtAccessToken(user: UserEntity) {
    const payload = { id: user.id, email: user.email, nickname: user.nickname };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRETKEY'),
      expiresIn: `${this.configService.get(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      )}h`,
    });
    return {
      accessToken: token,
      httpOnly: true,
      domain: this.configService.get('COOKIE_DOMAIN'),
      path: '/',
      maxAge:
        Number(this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')) *
        60 *
        60,
    };
  }

  getCookieWithJwtRefreshToken(user: UserEntity) {
    const payload = { id: user.id };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRETKEY'),
      expiresIn: `${this.configService.get(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      )}d`,
    });

    return {
      refreshToken: token,
      domain: this.configService.get('COOKIE_DOMAIN'),
      path: '/',
      httpOnly: true,
      //env값 * 1일
      maxAge:
        Number(this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')) *
        60 *
        60 *
        24,
    };
  }

  getCookiesForLogOut() {
    return {
      accessOption: {
        domain: this.configService.get('COOKIE_DOMAIN'),
        path: '/',
        httpOnly: true,
        maxAge: 0,
      },
      refreshOption: {
        domain: this.configService.get('COOKIE_DOMAIN'),
        path: '/',
        httpOnly: true,
        maxAge: 0,
      },
    };
  }
}
