---
title: input 参数模型
preview: /greet?name=Midway
focus: /src/server/api/home.api.ts
routes:
  - /
  - /greet?name=Midway
  - /user/1
  - /search/book?keyword=midway
checks:
  - /calc/add?a=1&b=2
---

# input 参数模型

Functional API 统一从 `input` 读请求：`params`、`query`、`body`、`headers`。

没有 `.input()` 时这些字段的类型是 `unknown`，不能直接读属性。用 zod 声明 schema 之后，框架会在进入 handler 前校验，并推断出类型：

```ts
import { z } from 'zod';

getUserById: api
  .get('/user/:id')
  .input({
    params: z.object({ id: z.string() }),
  })
  .handle(async ({ input }) => {
    return { id: input.params.id }; // string
  }),
```

查询参数在 URL 里都是字符串，用 `z.coerce` 转成数字，再用 `default` 给默认值：

```ts
query: z.object({
  page: z.coerce.number().int().min(1).default(1),
}),
```

右侧已经有 `/greet`、`/user/:id`、`/search/:category`。`/greet?name=harry` 可以马上试。

## 练习

补一个 `GET /calc/:operation`，query 里的 `a`、`b` 用 `z.coerce.number()`，支持 `add` / `subtract` / `multiply` / `divide`。访问 `/calc/add?a=1&b=2` 应返回 `result: 3`。
