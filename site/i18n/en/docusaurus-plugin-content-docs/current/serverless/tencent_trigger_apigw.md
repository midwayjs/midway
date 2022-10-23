# API Gateway（HTTP）

API Gateway is similar to HTTP functions in Tencent Cloud Function System, through which we publish functions as HTTP services.

## Usage

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
    return 'hello ${name}';
  }
}
```

After `npm run deploy`, you can access the link that is output from the console.

## Local test

Same as the traditional application HTTP test, the function app is created by createFunctionApp and tested by createHttpRequest method.

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
