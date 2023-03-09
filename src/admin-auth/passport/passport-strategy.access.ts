import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { LoginAdminDto } from 'src/admin/dto/login-admin.dto';
import { AdminAuthService } from '../admin-auth.service';


@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, 'admin') {
  constructor(
    private adminAuthService: AdminAuthService,
    private configService: ConfigService,
  ) {
    super({
      //jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          return request?.cookies?.accessToken;
        },
      ]),
      ignoreExpiration: true,
      secretOrKey: configService.get('JWT_ACCESS_SECRETKEY'),
    });
  }
  async validate(payload: LoginAdminDto, done: VerifiedCallback): Promise<any> {
    console.log(222, payload.loginId)

    const admin = await this.adminAuthService.getAdminById(payload.loginId) 
    if (payload.loginId === undefined) {
      return done(
        new UnauthorizedException({ message: '관리자를 찾을 수 없습니다.' }),
        false
      );
    }else{
      return done(null, admin);}
   
  }
}