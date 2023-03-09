import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrmConfig } from './config/orm.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from './user/user.service';
import { SmsService } from './sms/sms.service';
import { SmsModule } from './sms/sms.module';
import { AuthService } from './auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from './global/entities/users.entity';
import * as Joi from 'joi';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { OrdersModule } from './orders/orders.module';
import { TerminusModule } from '@nestjs/terminus';
import { HealthCheckController } from 'src/helath-check/health-check.controller';
import { HttpModule } from '@nestjs/axios';
import { LoggingModule } from './global/util/logger/logger.module';
import { JwtGoogleStrategy } from './auth/strategy/jwt-google.strategy';
import { AuthController } from './auth/auth.controller';
import { SocialModule } from './social/social.module';
import { validationSchema } from './config/validationSchema';
import { EmailController } from './email/email.controller';
import { EmailModule } from './email/email.module';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { ViewController } from './views/view.controller';
import { AdminLoginController } from './views/admin-login.controller';
import { ProductsController } from './products/products.controller';
import { ProductsModule } from './products/products.module';



@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    UserModule,
    AuthModule,
    TypeOrmModule.forRootAsync({
      useClass: OrmConfig,
      inject: [ConfigService],
    }),
    SmsModule,
    AdminModule,
    OrdersModule,
    LoggingModule,
    TerminusModule,
    SocialModule,
    EmailModule,
    AdminAuthModule,
    ProductsModule
  ],
  controllers: [AppController, HealthCheckController, AuthController, EmailController, ViewController,AdminLoginController ],

  providers: [
    AppService,
    SmsService,
    AuthService,
    UserService,
    JwtService,
    HttpModule,
    JwtGoogleStrategy,
    HealthCheckController,
    // { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
