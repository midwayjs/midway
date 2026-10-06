import {
  Controller,
  Post,
  Body,
  Inject,
  Get,
  Param,
} from '@midwayjs/core';
import { UserService } from '../service/user.service';
import { ValidationError, NotFoundError } from '../error/custom.error';

@Controller('/api/users')
export class UserController {
  @Inject()
  userService: UserService;

  @Post('/')
  async create(@Body() body: any) {
    const { name, email } = body;

    if (!name || !email) {
      throw new ValidationError('姓名和邮箱不能为空');
    }

    const user = await this.userService.createUser(name, email);
    return {
      success: true,
      message: '用户创建成功',
      data: user,
    };
  }

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    const userId = parseInt(id);

    if (isNaN(userId)) {
      throw new ValidationError('用户ID必须是数字');
    }

    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundError('用户');
    }

    return {
      success: true,
      data: user,
    };
  }
}
