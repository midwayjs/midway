import { Controller, Get, Post, Body } from '@midwayjs/core';

@Controller('/users', {
  version: '1',
  description: 'Users API v1'
})
export class UsersV1Controller {
  @Get('/')
  async getUsers() {
    return {
      version: 'v1',
      users: [
        { id: 1, name: 'John', email: 'john@example.com' }
      ]
    };
  }

  @Post('/')
  async createUser(@Body() user: any) {
    return {
      version: 'v1',
      user: { id: 2, ...user }
    };
  }
}

@Controller('/users', {
  version: '2',
  description: 'Users API v2'
})
export class UsersV2Controller {
  @Get('/')
  async getUsers() {
    return {
      version: 'v2',
      data: {
        users: [
          { id: 1, name: 'John', email: 'john@example.com', profile: { avatar: 'avatar.jpg' } }
        ],
        meta: { total: 1, page: 1 }
      }
    };
  }

  @Post('/')
  async createUser(@Body() user: any) {
    return {
      version: 'v2',
      data: { user: { id: 2, ...user, profile: {} } },
      meta: { created: new Date().toISOString() }
    };
  }
}