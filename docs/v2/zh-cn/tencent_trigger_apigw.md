---
title: API 网关（HTTP）
---

API 网关在腾讯云函数体系中类似于 HTTP 函数，我们通过它将函数发布为 HTTP 服务。

## 使用方式

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator';
import { Context } from '@midwayjs/faas';

@Provide()
export class HelloTencentService {
  @Inject()
  ctx: Context;

  @ServerlessTrigger(ServerlessTriggerType.API_GATEWAY, {
    path: '/api_gateway_tencent',
    method: 'post',
  })
  async handleAPIGatewayEvent(@Body() name) {
    return `hello ${name}`;
  }
}
```

在 `npm run deploy` 后即可通过控制台输出的链接访问。

## 本地测试

和传统应用 HTTP 测试相同，通过 createFunctionApp 创建函数 app，通过 createHttpRequest 方式进行测试。

```typescript
import { Framework } from '@midwayjs/serverless-app';
import { createFunctionApp, createHttpRequest } from '@midwayjs/mock';

describe('test/hello_tencent.test.ts', () => {
  let app: Application;
  let instance: HelloTencentService;

  beforeAll(async () => {
    // create app
    app = await createFunctionApp<Framework>();
  });

  afterAll(async () => {
    await close(app);
  });

  it('should get result from http trigger', async () => {
    const result = await createHttpRequest(app).post('api_gateway_tencent').send({
      name: 'zhangting',
    });

    expect(result.text).toEqual('hello zhangting');
  });
});
```
