import {IsString } from 'class-validator';

export class LoginAdminDto {

  @IsString()
  readonly loginId: string;

  @IsString()
  readonly loginPw: string;
  
}