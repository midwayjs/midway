---
title: 事件触发器（Event）
---

发布不包含触发器的函数，这是最简单的类型，可以直接通过 event 手动触发参数，也可以在平台绑定其他触发器。

## 使用方式

通过直接在代码中的 `@ServerlessTrigger`  装饰器绑定事件触发器。

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator';
import { Context, FC } from '@midwayjs/faas';

@Provide()
export class HelloAliyunService {
  @Inject()
  ctx: Context;

  @ServerlessTrigger(ServerlessTriggerType.EVENT)
  async handleEvent(event: any) {
    return event;
  }
}
```

## 本地测试

通过 `createFunctionApp`  创建函数 app，通过 `getServerlessInstance`  获取类实例，然后通过实例的方法直接调用，传入参数进行测试。

```typescript
describe('test/hello_aliyun.test.ts', () => {
  let app: Application;
  let instance: HelloAliyunService;

  beforeAll(async () => {
    // create app
    app = await createFunctionApp<Framework>(join(__dirname, '../'), {
      initContext: createInitializeContext(),
    });
    instance = await app.getServerlessInstance<HelloAliyunService>(HelloAliyunService);
  });

  afterAll(async () => {
    await close(app);
  });

  it('should get result from event trigger', async () => {
    expect(await instance.handleEvent('hello world')).toEqual('hello world');
  });
});
```
