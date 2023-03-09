import { Controller, Get, Render } from '@nestjs/common';
import {Public} from "../global/common/decorator/skip-auth.decorator";

@Controller('admin-login')
export class AdminLoginController {
  @Public()
  @Get()
  @Render('admin-login.ejs')
  async view() {
    return { name: 'peter', age: 28, job: 'software engineer'};
  }
}