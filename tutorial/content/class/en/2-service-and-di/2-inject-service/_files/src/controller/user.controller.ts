import { Controller, Get, Query, Param, Inject } from '@midwayjs/core';
import { UserService } from '../service/user.service';

@Controller('/api/users')
export class UserController {
  @Inject()
  userService: UserService;

  // List all users
  @Get('/')
  async list() {
    const users = await this.userService.getUsers();
    return {
      success: true,
      data: users
    };
  }

  // Get one user
  @Get('/:id')
  async getOne(@Param('id') id: string) {
    const user = await this.userService.getUserById(parseInt(id));
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }
    return {
      success: true,
      data: user
    };
  }

  // Search users
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
