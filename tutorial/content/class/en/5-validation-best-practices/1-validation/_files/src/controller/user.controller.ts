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
import { CreateUserDTO, QueryUserDTO, UpdateUserDTO } from '../dto/user.dto';

@Controller('/api/users')
export class UserController {
  @Inject()
  userService: UserService;

  @Get('/')
  async list(@Query() query: QueryUserDTO) {
    if (query.keyword) {
      const users = await this.userService.searchUsers(query.keyword);
      return {
        success: true,
        data: users,
        count: users.length,
      };
    }

    const users = await this.userService.getUsers();
    return {
      success: true,
      data: users,
      count: users.length,
    };
  }

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    const user = await this.userService.getUserById(parseInt(id));
    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }
    return {
      success: true,
      data: user,
    };
  }

  @Post('/')
  async create(@Body() dto: CreateUserDTO) {
    const user = await this.userService.createUser(dto.name, dto.email, dto.age);
    return {
      success: true,
      message: 'User created successfully',
      data: user,
    };
  }

  @Put('/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDTO) {
    const user = await this.userService.updateUser(parseInt(id), dto);
    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }
    return {
      success: true,
      message: 'User updated successfully',
      data: user,
    };
  }

  @Del('/:id')
  async delete(@Param('id') id: string) {
    const success = await this.userService.deleteUser(parseInt(id));
    if (!success) {
      return {
        success: false,
        message: 'User not found',
      };
    }
    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
}
