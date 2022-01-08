---
title: COS 触发器（对象存储）
---

COS 是腾讯云用于存储一些资源文件的服务。

## 使用方式

```typescript
import {
  Provide,
  Inject,
  ServerlessTrigger,
  ServerlessTriggerType,
} from '@midwayjs/decorator';
import { Context, SCF } from '@midwayjs/faas';

@Provide()
export class HelloTencentService {
  @Inject()
  ctx: Context;

  @ServerlessTrigger(ServerlessTriggerType.OS, {
    bucket: 'cli-appid.cos.ap-beijing.myqcloud.com',
    events: 'cos:ObjectCreated:*,
    filter: {
      prefix: 'filterdir/',
      suffix: '.jpg',
    },
  })
  async handleCOSEvent(event: SCF.COSEvent) {
    // xxx
  }
}
```

在 `npm run deploy` 后，即可。

## OSS 触发器配置

| 属性名 | 类型   | 描述                   |
| ------ | ------ | ---------------------- |
| bucket | string | 对象存储的 bucket 地址 |
| events | string | 触发函数执行的事件名   |
| filter | {      |

prefix: string;
   suffix: string;
 } | 对象过滤参数，满足过滤条件的 对象才可以触发函数，包含一个配置属性 key，表示过滤器支持过滤的对象键 (key)。 |
| | | |

示例：

**监听对象创建事件**

```typescript
  @ServerlessTrigger(ServerlessTriggerType.OS, {
    bucket: 'cli-appid.cos.ap-beijing.myqcloud.com',
    events: 'cos:ObjectCreated:*,
    filter: {
      prefix: 'filterdir/',
      suffix: '.jpg',
    },
  })
```

## 事件结构

COS 消息返回的结构如下，在 `SCF.COSEvent` 类型中有描述。

```json
{
  "Records": [
    {
      "cos": {
        "cosSchemaVersion": "1.0",
        "cosObject": {
          "url": "http://testpic-1253970026.cos.ap-chengdu.myqcloud.com/testfile",
          "meta": {
            "x-cos-request-id": "NWMxOWY4MGFfMjViMjU4NjRfMTUyMV8yNzhhZjM=",
            "Content-Type": ""
          },
          "vid": "",
          "key": "",
          "size": 1029
        },
        "cosBucket": {
          "region": "cd",
          "name": "testpic",
          "appid": "1253970026"
        },
        "cosNotificationId": "unkown"
      },
      "event": {
        "eventName": "cos:ObjectCreated:*",
        "eventVersion": "1.0",
        "eventTime": 1545205770,
        "eventSource": "qcs::cos",
        "requestParameters": {
          "requestSourceIP": "192.168.15.101",
          "requestHeaders": {
            "Authorization": "****************"
          }
        },
        "eventQueue": "qcs:0:lambda:cd:appid/1253970026:default.printevent.$LATEST",
        "reservedInfo": "",
        "reqid": 179398952
      }
    }
  ]
}
```

## 本地开发

## 本地开发

事件类型的函数本地无法使用 dev 开发，只能通过运行 `npm run test` 进行测试执行。

## 本地测试

和 HTTP 测试不同，通过 `createFunctionApp` 创建函数 app，通过 `getServerlessInstance` 获取整个类的实例，从而调用到特定方法来测试。

可以通过 `createCOSEvent` 方法快速创建平台传入的结构。

```typescript
import { createFunctionApp, close } from '@midwayjs/mock';
import { Framework, Application } from '@midwayjs/serverless-app';
import { HelloTencentService } from '../src/function/hello_tencent';
import { createCOSEvent } from '@midwayjs/serverless-scf-trigger';
import { join } from 'path';

describe('test/hello_tencent.test.ts', () => {
  let app: Application;
  let instance: HelloTencentService;

  beforeAll(async () => {
    // create app
    app = await createFunctionApp<Framework>();
    instance = await app.getServerlessInstance<HelloTencentService>(HelloTencentService);
  });

  afterAll(async () => {
    await close(app);
  });

  it('should get result from timer trigger', async () => {
    expect(await instance.handleCOSEvent(createCOSEvent())).toEqual('hello world');
  });
});
```
