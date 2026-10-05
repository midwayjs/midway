---
title: 用 mock 写接口测试
focus: /test/home.test.ts
test: true
checks:
  - /health
---

# 用 mock 写接口测试

契约、中间件和错误格式都有了之后，补一层能跑的 HTTP 测试。右侧项目加了 `jest` / `ts-jest`。`npm test` 使用 `NODE_ENV=unittest`，读取 `koa.port: null`，不会和 `npm run dev` 抢 7001。

```ts
import { createApp, close, createHttpRequest } from '@midwayjs/mock';

it('GET /', async () => {
  const res = await createHttpRequest(app).get('/');
  expect(res.status).toBe(200);
  expect(res.body.message).toBe('Hello Midway Functional!');
});
```

`createApp(process.cwd())` 从当前项目拉起测试 app。在右侧新开终端执行：

```bash
npm test
```

## 练习

1. 在 `home.api.ts` 增加 `GET /health`，返回 `{ ok: true }`
2. 在 `test/home.test.ts` 补上对应断言

再跑一次 `npm test`。卡住了点「查看答案」。

发布前还可以再确认：核心写接口有 `input/output`、错误返回是 JSON、`createClient` 的 `basePath` 和 `globalPrefix` 一致。这些比空的清单更有用。
