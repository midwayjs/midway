# 前端集成

这一节给出一条可直接落地的路线：把 React/Vue 项目和函数式 Midway 接起来。

## 1. 安装依赖

如果你已经是前端项目，只需补 Midway 相关依赖。

React：

```bash
$ npm i @midwayjs/core @midwayjs/web-bridge @midwayjs/mock @midwayjs/react zod
```

Vue：

```bash
$ npm i @midwayjs/core @midwayjs/web-bridge @midwayjs/mock @midwayjs/vue zod
```

## 2. 准备目录

```txt
.
├── package.json                 # 项目脚本与依赖
├── vite.config.ts               # Vite 配置（含 devPlugin/apiPlugin）
├── src
│   ├── main.tsx / main.ts       # React/Vue 入口
│   ├── web
│   │   ├── app.tsx / app.vue    # 前端根组件
│   │   └── api
│   │       └── client.ts        # 前端 API 客户端
│   └── server
│       ├── index.ts             # Midway 服务端入口（也可命名为 configuration.ts）
│       └── api
│           └── user.api.ts      # 服务端 API 定义
└── tsconfig.json                # TypeScript 配置
```

## 3. 定义服务端 API

```ts
// src/server/api/user.api.ts
import { defineApi } from '@midwayjs/core/functional';
import { z } from 'zod';

export const userApi = defineApi('/users', api => ({
  getUser: api
    .get('/:id')
    .input({
      params: z.object({ id: z.string() }),
    })
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .handle(async ({ input }) => {
      return {
        id: input.params.id,
        name: 'harry',
      };
    }),
}));
```

这里有两个效果：

1. `input(...)` 会在运行时校验 `params/query/body/headers`
2. schema 的类型会继续传给 `handle(...)`，所以上面可以直接写 `input.params.id`

## 4. 创建前端 client

React：

```ts
// src/web/api/client.ts
import { createClient } from '@midwayjs/react';
import { userApi } from '../../server/api/user.api';

export const api = createClient(
  { user: userApi },
  { basePath: '/api' }
);
```

Vue：

```ts
// src/web/api/client.ts
import { createClient } from '@midwayjs/vue';
import { userApi } from '../../server/api/user.api';

export const api = createClient(
  { user: userApi },
  { basePath: '/api' }
);
```

## 5. 在页面里调用

React：

```tsx
import { useEffect, useState } from 'react';
import { api } from './api/client';

export function UserPage() {
  const [name, setName] = useState('');

  useEffect(() => {
    api.user.getUser({ params: { id: 'u-1' } }).then(user => {
      setName(user.name);
    });
  }, []);

  return <div>{name}</div>;
}
```

Vue：

```ts
// setup()
const user = await api.user.getUser({
  params: { id: 'u-1' },
});
```

## 6. 配置 Vite 桥接

```ts
import { defineConfig } from 'vite';
import { devPlugin } from '@midwayjs/mock/vite';
import { apiPlugin } from '@midwayjs/web-bridge/vite';

export default defineConfig({
  plugins: [
    devPlugin({
      appDir: process.cwd(),
      baseDir: 'src/server',
      basePath: '/api',
    }),
    apiPlugin({
      root: process.cwd(),
      apiDir: 'src/server/api',
      target: 'both',
    }),
  ],
});
```

- React 项目再加 `@vitejs/plugin-react`
- Vue 项目再加 `@vitejs/plugin-vue`

## 7. 函数式中间件

路由级：

```ts
api.get('/:id').meta({ middleware: [authMw] }).handle(async () => ({}));
```

模块级：

```ts
defineApi('/users', api => ({
  getUser: api.get('/:id').handle(async () => ({})),
}), {
  middleware: [authMw],
});
```

## 8. 启动与验证

1. `$ npm run dev`
2. 打开页面触发 API 调用
3. 在浏览器网络面板确认请求命中 `/api/*`

## 9. Rspack 场景（可选）

```ts
createApiRspackRule({
  root: process.cwd(),
  apiDir: 'src/server/api',
});
```

## 10. 自定义目录说明

`src/web/api` 只是推荐目录，不是强制。你可以改成 `src/client/api` 等。

只要保证以下两处同步：

1. 前端 `client.ts` 的真实路径与导入路径
2. 构建插件 `apiDir` 指向正确的服务端 API 定义目录
