# 测试

建议把 Functional API 的测试分成三层：契约层、服务端层、前端调用层。

## 1. 契约层测试（快）

目标：验证 `input/output` 与 handler 行为是否符合预期。

你可以直接测试 API 调用返回，重点覆盖：

- 正常输入
- 非法输入（应该失败）
- 边界输入（空值、极值）

## 2. 服务端集成测试（主力）

目标：验证真实 HTTP 路由是否可用（含中间件、prefix、状态码）。

常见做法：

- 用 `@midwayjs/mock` 启动测试 app
- 用请求工具打 `/api/...` 路由
- 断言状态码、响应体、header

示例（简化）：

```ts
import { close, createApp, createHttpRequest } from '@midwayjs/mock';

describe('functional api', () => {
  let app;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await close(app);
  });

  it('GET /api/users/:id should work', async () => {
    const result = await createHttpRequest(app).get('/api/users/u-1');
    expect(result.status).toBe(200);
    expect(result.body.id).toBe('u-1');
  });
});
```

## 3. 前端调用层测试（按需）

目标：验证页面调用 typed client 时的行为（成功、失败、loading）。

建议：

- 单元测试里 mock client 返回值
- E2E 再验证一条真实链路

## 推荐测试优先级

1. 先补服务端集成测试（收益最高）  
2. 再补关键契约层测试（参数和返回）  
3. 最后补前端调用层测试（交互体验）  

## 覆盖点清单

- 参数校验失败是否按预期报错
- 中间件是否生效（例如鉴权）
- `globalPrefix` / version 路由是否正确
- 响应结构是否符合 `output(...)`

