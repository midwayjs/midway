---
title: API 网关
---

API 网关在阿里云函数体系中比较特殊，他类似于创建一个无触发器函数，通过平台网关的绑定到特定的路径上。

## 使用方式

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator';
import { Context } from '@midwayjs/faas';

@Provide()
export class HelloAliyunService {
  @Inject()
  ctx: Context;

  @ServerlessTrigger(ServerlessTriggerType.API_GATEWAY, {
    path: '/api_gateway_aliyun',
    method: 'post',
  })
  async handleAPIGatewayEvent(@Body() name) {
    return `hello ${name}`;
  }
}
```

在 `npm run deploy` 后，参考[阿里云文档](https://help.aliyun.com/document_detail/74798.html?spm=a2c4g.11186623.6.701.3be978a1MKsNN4)配置即可。

:::info
当前 API 网关线上的路由在平台进行配置。
:::

## 本地测试

和 HTTP 测试相同，通过 `createFunctionApp` 创建函数 app，通过 `createHttpRequest` 方式进行测试。

```typescript
import { Framework } from '@midwayjs/serverless-app';
import { createInitializeContext } from '@midwayjs/serverless-fc-trigger';
import { createFunctionApp, createHttpRequest } from '@midwayjs/mock';

describe('test/hello_aliyun.test.ts', () => {
  let app: Application;
  let instance: HelloAliyunService;

  beforeAll(async () => {
    // create app
    app = await createFunctionApp<Framework>(join(__dirname, '../'), {
      initContext: createInitializeContext(),
    });
  });

  afterAll(async () => {
    await close(app);
  });

  it('should get result from http trigger', async () => {
    const result = await createHttpRequest(app).post('api_gateway_aliyun').send({
      name: 'zhangting',
    });

    expect(result.text).toEqual('hello zhangting');
  });
});
```
