import { Controller, Get, Query, Param, Inject } from '@midwayjs/core';
import { UserService } from '../service/user.service';

@Controller('/api/users')
export class UserController {
  @Inject()
  userService: UserService;

  // 获取所有用户
  @Get('/')
  async list() {
    const users = await this.userService.getUsers();
    return {
      success: true,
      data: users
    };
  }

  // 获取单个用户
  @Get('/:id')
  async getOne(@Param('id') id: string) {
    const user = await this.userService.getUserById(parseInt(id));
    if (!user) {
      return {
        success: false,
        message: '用户不存在'
      };
    }
    return {
      success: true,
      data: user
    };
  }

  // 搜索用户
  @Get('/search')
  async search(@Query('keyword') keyword: string) {
    const users = await this.userService.searchUsers(keyword || '');
    return {
      success: true,
      data: users,
      count: users.length
    };
  }
}
