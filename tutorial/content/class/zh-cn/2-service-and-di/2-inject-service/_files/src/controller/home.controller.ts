import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return {
      message: '第五课：依赖注入的使用',
      apis: {
        users: '/api/users - 获取所有用户',
        userById: '/api/users/:id - 获取单个用户',
        search: '/api/users/search?keyword=xxx - 搜索用户'
      }
    };
  }
}
