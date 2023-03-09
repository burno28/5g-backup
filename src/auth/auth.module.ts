import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../global/entities/users.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtRefreshStrategy } from './strategy/jwt-refresh.strategy';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtGoogleStrategy } from './strategy/jwt-google.strategy';
import { SocialModule } from '../social/social.module';
import { SocialController } from '../social/social.controller';
import { SocialService } from 'src/social/social.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule,
    ConfigModule,
    UserModule,
    SocialModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRETKEY'),
        signOptions: {
          expiresIn: `${configService.get(
            'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
          )}s`,
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    UserService,
    JwtService,
    SocialService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtGoogleStrategy, //구글 소셜 로그인

    // JwtNaverStrategy, //네이버 소셜 로그인
    // JwtKakaoStrategy, //카카오 소셜 로그인
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
