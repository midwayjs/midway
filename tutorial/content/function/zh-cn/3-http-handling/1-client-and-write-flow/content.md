---
title: client 接入与写接口
preview: /users
focus: /src/web/api/client.ts
routes:
  - /users
  - /users/u-1
---

# client 接入与写接口

`defineApi` 的收益是同一份契约可以生成类型化客户端。`createClient` 会按路由名拼出 `api.user.getOne({ params: { id } })` 这样的调用，不再手写 method/path。

```ts
import { createClient } from '@midwayjs/web-bridge';
import { userApi } from '../../server/api/user.api';

export const api = createClient(
  { user: userApi },
  { manifest: false }
);
```

`manifest: false` 表示直接用这份 `defineApi` 对象发 HTTP，不依赖 Vite 插件生成的路由清单。本教程的预览窗口跑的是 Midway 服务端，没有单独的前端构建。

- 服务端前缀是 `/users`，没有 `globalPrefix` 时请求就是 `/users/:id`
- 若以后在 `koa.globalPrefix` 里加了 `/api`，client 的 `basePath` 也要改成 `/api`，两边必须一致
- `src/web/pages/user.page.ts` 演示页面里会怎么调用；真正接 React/Vue 时，把同样的 `createClient` 放进 Vite 项目即可

右侧 `user.api.ts` 已经包含 POST / PUT / DELETE。创建时用 `useContext()` 把状态码设成 201：

```ts
const ctx = useContext();
ctx.status = 201;
```

写操作可以用 curl 验证：

```bash
curl -X POST http://localhost:7001/users \
  -H 'content-type: application/json' \
  -d '{"name":"kate","email":"kate@example.com"}'
```
