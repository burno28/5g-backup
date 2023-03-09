import { SocialController } from './social.controller';
import { AppService } from '../app.service';
import { JwtGoogleStrategy } from '../auth/strategy/jwt-google.strategy';
import { Module } from '@nestjs/common';
import { SocialService } from './social.service';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../global/entities/users.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [SocialController],
  providers: [
    SocialService,
    AppService,
    JwtService,
    JwtGoogleStrategy,
    UserService,
    AuthService,
  ],
})
export class SocialModule {}
