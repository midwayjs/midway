# defineApi 基础用法

`defineApi` 放在 `@midwayjs/core/functional`，用于声明函数式 HTTP API。

## 安装

```bash
npm i @midwayjs/core zod
```

```json
{
  "dependencies": {
    "@midwayjs/core": "^4.0.0-beta.11",
    "zod": "^3.0.0"
  }
}
```

## 服务端定义

```ts
// src/server/api/user.api.ts
import { defineApi, useInject } from '@midwayjs/core/functional';
import { z } from 'zod';

export const userApi = defineApi('/users', api => ({
  getUser: api
    .get('/:id')
    .input({
      params: z.object({
        id: z.string(),
      }),
    })
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .handle(async ({ input }) => {
      const userService = await useInject('userService');
      return userService.find(input.params.id);
    }),

  createUser: api
    .post('/')
    .input({
      body: z.object({
        name: z.string().min(1),
      }),
    })
    .handle(async ({ input }) => {
      const userService = await useInject('userService');
      return userService.create(input.body);
    }),
}));
```

## API 聚合导出

```ts
// src/server/api/index.ts
export { userApi } from './user.api';
```

建议前后端都从这个聚合入口消费。

## 与 class 装饰器的对应关系

- `@Controller('/users')` -> `defineApi('/users', ...)`
- `@Get('/:id')` -> `api.get('/:id')`
- `@Post('/')` -> `api.post('/')`
- `@Inject()` 取服务 -> `useInject('serviceName')`

## 共存

同一项目中可以同时保留：

- class controller（既有代码）
- functional api（新模块）

统一由 Midway 路由系统注册与冲突检测。
