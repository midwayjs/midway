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

## 4. HTTP 多客户端（fetch / axios）切换示例

```ts
import { createClient } from '@midwayjs/react';
import { userApi } from '@/server/api';
import axios from 'axios';

const fetchApi = createClient(
  { user: userApi },
  {
    basePath: '/api',
    // 默认 adapter 即 fetch，可省略
  }
);

const axiosApi = createClient(
  { user: userApi },
  {
    basePath: '/api',
    adapter: async ({ operation, input }) => {
      const res = await axios.request({
        method: operation.method.toUpperCase(),
        url: operation.fullPath,
        params: input?.query,
        data: input?.body,
      });
      return res.data;
    },
  }
);
```

## 5. 自定义 Transport（tRPC 风格）示例

```ts
import { createClient } from '@midwayjs/react';
import { userApi } from '@/server/api';
import { trpc } from '@/web/trpc-client';

const trpcApi = createClient(
  { user: userApi },
  {
    adapter: async ({ operation, input }) => {
      // operationId 由约定映射到 tRPC procedure
      // 例如：user.getUser -> user.getUser
      return trpc.call(operation.operationId, input);
    },
  }
);

const user = await trpcApi.user.getUser({
  params: { id: 'u-1' },
});
```

## 6. React Router 适配（基于 route manifest）

```ts
import type { RouteObject } from 'react-router-dom';
import type { RouteManifestItem } from '@midwayjs/core';

export function toReactRouter(manifest: RouteManifestItem[]): RouteObject[] {
  return manifest
    .filter(item => item.method.toLowerCase() === 'get')
    .map(item => ({
      path: item.fullPath,
      loader: async ({ params }) => {
        // 根据 operationId/路径映射到客户端调用
        // 示例：user.getUser
        if (item.operationId === 'user.getUser') {
          const { api } = await import('@/web/api/client');
          return api.user.getUser({ params });
        }
        return null;
      },
    }));
}
```

## 7. Next Route Handler 适配（基于 route manifest）

```ts
import { NextResponse } from 'next/server';
import type { RouteManifestItem } from '@midwayjs/core';
import { api } from '@/app/lib/api-client';

const manifest: RouteManifestItem[] = []; // 由构建期或运行期注入

export async function GET(
  _req: Request,
  context: { params: { id: string } }
) {
  const operation = manifest.find(item => item.operationId === 'user.getUser');
  if (!operation) {
    return NextResponse.json({ message: 'operation not found' }, { status: 404 });
  }
  const data = await api.user.getUser({
    params: { id: context.params.id },
  });
  return NextResponse.json(data);
}
```

## 8. Vue Router 适配（基于 route manifest）

```ts
import type { RouteRecordRaw } from 'vue-router';
import type { RouteManifestItem } from '@midwayjs/core';
import { api } from '@/web/api/client';

export function toVueRoutes(manifest: RouteManifestItem[]): RouteRecordRaw[] {
  return manifest
    .filter(item => item.method.toLowerCase() === 'get')
    .map(item => ({
      name: item.operationId,
      path: item.fullPath,
      component: () => import('@/web/pages/api-proxy-page.vue'),
      props: route => ({ operationId: item.operationId, params: route.params }),
      beforeEnter: async to => {
        if (item.operationId === 'user.getUser') {
          await api.user.getUser({ params: to.params });
        }
      },
    }));
}
```

## 9. 同仓开发示例（server + vue）

```txt
src/
  server/
    configuration.ts
    api/
      user.api.ts
  web/
    main.ts
    app.vue
    api/
      client.ts
```

```ts
// src/web/api/client.ts
import { createClient } from '@midwayjs/api-bridge';
import { userApi } from '../../server/api/user.api';

export const api = createClient(
  { user: userApi },
  {
    basePath: '/api',
  }
);
```
