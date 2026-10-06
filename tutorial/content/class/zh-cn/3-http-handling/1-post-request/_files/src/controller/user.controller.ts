import {
  Controller,
  Get,
  Post,
  Put,
  Del,
  Param,
  Body,
  Query,
  Inject,
} from '@midwayjs/core';
import { UserService } from '../service/user.service';

interface CreateUserDTO {
  name: string;
  email: string;
}

interface UpdateUserDTO {
  name?: string;
  email?: string;
}

@Controller('/api/users')
export class UserController {
  @Inject()
  userService: UserService;

  @Get('/')
  async list() {
    const users = await this.userService.getUsers();
    return {
      success: true,
      data: users,
    };
  }

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    const user = await this.userService.getUserById(parseInt(id));
    if (!user) {
      return {
        success: false,
        message: '用户不存在',
      };
    }
    return {
      success: true,
      data: user,
    };
  }

  @Post('/')
  async create(@Body() dto: CreateUserDTO) {
    const user = await this.userService.createUser(dto.name, dto.email);
    return {
      success: true,
      message: '用户创建成功',
      data: user,
    };
  }

  @Put('/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDTO) {
    const user = await this.userService.updateUser(parseInt(id), dto);
    if (!user) {
      return {
        success: false,
        message: '用户不存在',
      };
    }
    return {
      success: true,
      message: '用户更新成功',
      data: user,
    };
  }

  @Del('/:id')
  async delete(@Param('id') id: string) {
    const success = await this.userService.deleteUser(parseInt(id));
    if (!success) {
      return {
        success: false,
        message: '用户不存在',
      };
    }
    return {
      success: true,
      message: '用户删除成功',
    };
  }

  @Get('/search')
  async search(@Query('keyword') keyword: string) {
    const users = await this.userService.searchUsers(keyword || '');
    return {
      success: true,
      data: users,
      count: users.length,
    };
  }
}
