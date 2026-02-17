# 用户使用范例（设计稿）

## 1. 装饰器写法 vs Functional 写法（一一对照）

### Class Decorator

```ts
import { Controller, Get, Post, Param, Body, Inject } from '@midwayjs/core';
import { UserService } from '../service/user.service';

@Controller('/users')
export class UserController {
  @Inject()
  userService: UserService;

  @Get('/:id')
  async getUser(@Param('id') id: string) {
    return this.userService.find(id);
  }

  @Post('/')
  async createUser(@Body('name') name: string) {
    return this.userService.create({ name });
  }
}
```

### Functional (`defineApi`)

```ts
import { defineApi, useInject } from '@midwayjs/core/functional';

export const userApi = defineApi('/users', api => ({
  getUser: api.get('/:id').handle(async ({ input }) => {
    const userService = await useInject('userService');
    return userService.find(input.params.id);
  }),

  createUser: api.post('/').handle(async ({ input }) => {
    const userService = await useInject('userService');
    return userService.create({ name: input.body.name });
  }),
}));
```

## 2. 前端 direct-like 调用（同仓复用 API 定义）

```ts
// src/web/api/client.ts
import { createClient } from '@midwayjs/react';
import { userApi } from '@/server/api';

export const api = createClient(
  {
    user: userApi,
  },
  {
    basePath: '/api',
  }
);

const user = await api.user.getUser({
  params: { id: 'u-1' },
});
```

## 3. 语义对齐说明

- 路由语义：`@Controller('/users') + @Get('/:id')` 对齐 `defineApi('/users') + api.get('/:id')`
- 运行时：都由现有 Web 路由系统统一注册与冲突检测
- 并存策略：class 与 functional 可在同一项目共存，按团队偏好选用
