---
title: input 参数模型
focus: /src/server/api/home.api.ts
---

# input 参数模型

Functional API 统一从 `input` 读取请求数据。

- `input.params`
- `input.query`
- `input.body`
- `input.headers`

用 `.input()` 为每一部分声明 schema（这里使用 zod），框架会在调用 handler 前完成校验，`input` 也会获得对应的类型：

```ts
import { z } from 'zod';

getUserById: api
  .get('/user/:id')
  .input({
    params: z.object({ id: z.string() }),
  })
  .handle(async ({ input }) => {
    return { id: input.params.id }; // id: string
  }),
```

查询参数在 URL 里都是字符串，可以用 `z.coerce` 转成数字，再配合 `default` 给出默认值：

```ts
query: z.object({
  page: z.coerce.number().int().min(1).default(1),
}),
```

没有声明 schema 的部分会被当作 `unknown`，不能直接读取字段。从这一层开始就可以形成稳定的请求契约。
