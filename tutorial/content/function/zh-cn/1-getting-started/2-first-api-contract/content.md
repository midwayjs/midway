---
title: 第一个 API 契约
focus: /src/server/api/home.api.ts
checks:
  - /ping
---

# 第一个 API 契约

`defineApi` 把「路径前缀 + HTTP 方法 + 处理函数」写在同一个模块里。

```ts
import { defineApi } from '@midwayjs/core/functional';

export const homeApi = defineApi('/', api => ({
  home: api.get('/').handle(async () => 'Hello Midway Functional!'),
}));
```

- 第一个参数 `'/'` 是这段 API 的前缀，相当于 `@Controller('/')`
- `api.get` / `api.post` / `api.put` / `api.delete` 对应 HTTP 方法
- 对象的 key（`home`）是路由名，给前端 client 调用时用：`api.home.home()`
- `.handle()` 里返回的值就是响应体

右侧 `src/server/api/home.api.ts` 已经能响应 `GET /`。

## 练习

再加一个 `GET /ping`，返回字符串 `pong`。保存后把预览指到 `/ping`。卡住了点「查看答案」。
