import { Module } from '@nestjs/common';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminStrategy } from './passport/passport-strategy.access';
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminsEntity } from '../global/entities/admins.entity';

import { JwtModule, JwtService } from '@nestjs/jwt';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [TypeOrmModule.forFeature([ AdminsEntity]),
  ConfigModule.forRoot({ isGlobal: true }),
  PassportModule.register({
    defaultStrategy: 'jwt',
    session: false,
  }),
  //registerAsync? ConfigService를 주입해두면, .env를 읽어올 때까지 secret을 등록하는 작업을 유예시킴.
  JwtModule.registerAsync({
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_ACCESS_SECRETKEY'),
      signOptions: { expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME') },
    }),
    inject: [ConfigService],
  }),],
  controllers: [AdminAuthController],
  providers: [AdminAuthService, AdminStrategy],
  exports: [AdminStrategy,PassportModule]
})
export class AdminAuthModule {}
