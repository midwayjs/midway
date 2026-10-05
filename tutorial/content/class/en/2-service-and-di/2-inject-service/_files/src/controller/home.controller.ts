import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return {
      message: 'Lesson 5: Dependency Injection',
      apis: {
        users: '/api/users - List all users',
        userById: '/api/users/:id - Get one user',
        search: '/api/users/search?keyword=xxx - Search users'
      }
    };
  }
}
