---
title: 用 mock 写接口测试
focus: /test/home.test.ts
test: true
routes:
  - /
  - /health
checks:
  - /health
---

# 用 mock 写接口测试

前面几课把路由、Service、中间件和校验都串起来了。上线前至少要有一层 HTTP 测试，确认路由真的能打通。

这一课右侧项目已经加上 `jest` 和 `ts-jest`。`npm test` 会把 `NODE_ENV` 设成 `unittest`，读取 `config.unittest.ts` 里的 `koa.port: null`，所以**不会占用 7001**，可以和正在跑的 `npm run dev` 并存。

## 测试目录

约定测试放在 `test/`，文件名以 `.test.ts` 结尾。右侧已经有 `test/home.test.ts`。

```typescript
import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Application } from '@midwayjs/koa';

describe('home', () => {
  let app: Application;

  beforeAll(async () => {
    app = await createApp(process.cwd());
  });

  afterAll(async () => {
    await close(app);
  });

  it('GET /', async () => {
    const res = await createHttpRequest(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Hello Midway!');
  });
});
```

`createApp(process.cwd())` 从当前项目启动一个测试用 app；`createHttpRequest(app)` 发请求但不走真实端口。

在右侧新开一个终端运行：

```bash
npm test
```

应该能看到 `GET /` 通过。

## 练习

1. 在 `HomeController` 增加 `GET /health`，返回 `{ ok: true }`。
2. 在 `test/home.test.ts` 补一条用例：状态码 200，且 `res.body.ok === true`。

再跑一次 `npm test`。卡住了点「查看答案」。

## 建议覆盖的路径

- 正常输入：200 和响应体
- 非法输入：校验失败（422）
- 业务错误：例如用户不存在（404）

不必在这一课写完所有用例。有一层能在 CI 里跑的 HTTP 测试，比空的「部署清单」有用得多。
