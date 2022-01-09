---
title: CMQ 触发器（消息队列）
---

CMQ（mq） 触发器，订阅的是腾讯云的消息队列服务。

## 使用方式

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator';
import { Context, SCF } from '@midwayjs/faas';

@Provide()
export class HelloTencentService {
  @Inject()
  ctx: Context;

  @ServerlessTrigger(ServerlessTriggerType.MQ, {
    topic: 'test-topic',
    tags: 'bbb',
  })
  async handleCMQEvent(event: SCF.CMQEvent) {
    // xxx
  }
}
```

在 `f deploy` 后，即可。

:::info
注意，在腾讯云下，midway faas 提供的默认消息队列格式为 JSON
:::

## CMS 触发器配置

| 属性名 | 类型   | 描述                                                           |
| ------ | ------ | -------------------------------------------------------------- |
| topic  | string | 接收消息的 topic                                               |
| tags   | string | 可选，描述了该订阅中消息过滤的标签（标签一致的消息才会被推送） |

示例：

**监听 MQ 消息**

```typescript
@ServerlessTrigger(ServerlessTriggerType.MQ, {
  topic: 'test-topic',
  region: 'cn-shanghai'
  strategy: 'BACKOFF_RETRY'
})
```

## 事件结构

CMQ 消息返回的结构如下，在 `SCF.CMQEvent` 类型中有描述。

```json
{
  "Records": [
    {
      "CMQ": {
        "type": "topic",
        "topicOwner": 1567,
        "topicName": "testtopic",
        "subscriptionName": "xxxxxx",
        "publishTime": "1970-01-01T00:00:00.000Z",
        "msgId": "123345346",
        "requestId": "123345346",
        "msgBody": "Hello from CMQ!",
        "msgTag": "tag1,tag2"
      }
    }
  ]
}
```

## 本地开发

事件类型的函数本地无法使用 dev 开发，只能通过运行 `npm run test` 进行测试执行。

## 本地测试

和 HTTP 测试不同，通过 `createFunctionApp` 创建函数 app，通过 `getServerlessInstance` 获取整个类的实例，从而调用到特定方法来测试。

可以通过 `createCMQEvent` 方法快速创建平台传入的结构。

```typescript
import { createFunctionApp, close } from '@midwayjs/mock';
import { Framework, Application } from '@midwayjs/serverless-app';
import { HelloTencentService } from '../src/function/hello_tencent';
import { createCMQEvent } from '@midwayjs/serverless-scf-trigger';
import { join } from 'path';

describe('test/hello_tencent.test.ts', () => {
  let app: Application;
  let instance: HelloTencentService;

  beforeAll(async () => {
    // create app
    app = await createFunctionApp<Framework>(join(__dirname, '../'), {
      initContext: createInitializeContext(),
    });
    instance = await app.getServerlessInstance<HelloTencentService>(HelloTencentService);
  });

  afterAll(async () => {
    await close(app);
  });

  it('should get result from cmq trigger', async () => {
    expect(await instance.handleCMQEvent(createCMQEvent())).toEqual('hello world');
  });
});
```
