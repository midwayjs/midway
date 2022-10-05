import {
  Body,
  Controller,
  Post,
} from '@midwayjs/core';
import { CodeLoginDTO, LoginDTO } from './dto/login.dto';

@Controller('/cats')
export class UserController {
  @Post('/login', { summary: '手机号密码登录'})
  async login(@Body() body: LoginDTO) {
    return null;
  }

  @Post('/smsLogin', { summary: '验证码密码登录'})
  async smsLogin(@Body() body: CodeLoginDTO) {
    return null;
  }
}
