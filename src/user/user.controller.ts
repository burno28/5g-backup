import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CreateUserDto, JwtDecodeDto } from './dto';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { Public } from 'src/global/common/decorator/skip-auth.decorator';
import { UserEntity } from '../global/entities/users.entity';
// #TODO 복수형으로 바꾸기?
// TODO : 유저 비밀번호 확인
@Controller('users')
export class UserController {

}
