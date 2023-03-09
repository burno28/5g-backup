import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminsEntity } from '../global/entities/admins.entity';
import { Repository } from 'typeorm';

import { JwtService } from "@nestjs/jwt";
import { LoginAdminDto } from '../admin/dto/login-admin.dto'

import { ConfigService } from '@nestjs/config';
import { Payload } from './passport/payload.interface';

@Injectable()
export class AdminAuthService {

    constructor(
        @InjectRepository(AdminsEntity) private adminRepository: Repository<AdminsEntity>,
        private jwtService: JwtService,
        private configService: ConfigService
      ) {};

    // 관리자 찾기 
async getAdminById  (adminId: string){
    return await this.adminRepository.findOne({where:{loginId: adminId}})
}

//admin 로그인 

async login(adminDto: LoginAdminDto) {
    const adminFind: AdminsEntity = await this.getAdminById(
      adminDto.loginId,
    );
    console.log('관리자 찾았쪙');

    if (!adminFind ||adminDto.loginPw !== adminFind.loginPw ) {
      throw new UnauthorizedException(
        '아이디 혹은 패스워드가 올바르지 않습니다.',
      );
    }

    const payload: Payload = {
      id: adminFind.id,
      loginId: adminDto.loginId
    };

    const token = this.jwtService.sign(payload)

    //페이로드에 아이디를 넣은 토큰 정보를 리턴
    return {
      accessToken: token,
      message:  `${adminFind.loginId} 관리자님 로그인 하셨습니다`,
      httpOnly: true,
      domain:this.configService.get('COOKIE_DOMAIN'),
      path: '/',
      maxAge:
        Number(this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')) *
        60 *
        60
    };
  }

  //로그아웃
  async logOut (){return {
    accessOption: {
      domain: this.configService.get('COOKIE_DOMAIN'),
      path: '/',
      httpOnly: true,
      maxAge: 0
    },
    message: '로그아웃 되셨습니다.'
}}

}
