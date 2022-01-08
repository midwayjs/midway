---
title: OSS 触发器（对象存储）
---

OSS 用于存储一些资源文件，是阿里云的资源存储产品。 当 OSS 中有文件创建，更新，对应的函数就会被触发而执行。

## 使用方式

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator';
import { Context, FC } from '@midwayjs/faas';

@Provide()
export class HelloAliyunService {
  @Inject()
  ctx: Context;

  @ServerlessTrigger(ServerlessTriggerType.OS, {
    bucket: 'ossBucketName',
    events: ['oss:ObjectCreated:*', 'oss:ObjectRemoved:DeleteObject'],
    filter: {
      prefix: 'filterdir/',
      suffix: '.jpg',
    },
  })
  async handleOSSEvent(event: FC.OSSEvent) {
    // xxx
  }
}
```

在 `npm run deploy` 后，即可。

## OSS 触发器配置

| 属性名 | 类型     | 描述                 |
| ------ | -------- | -------------------- |
| bucket | string   | 对象存储的 bucket 名 |
| events | string[] | 触发函数执行的事件名 |
| filter | {        |

prefix: string;
   suffix: string;
 } | 对象过滤参数，满足过滤条件的 对象才可以触发函数，包含一个配置属性 key，表示过滤器支持过滤的对象键 (key)。 |
| | | |

示例：

**监听对象创建和对象删除时的事件**

```typescript
@ServerlessTrigger(ServerlessTriggerType.OS, {
  bucket: 'ossBucketName',
  events: ['oss:ObjectCreated:*', 'oss:ObjectRemoved:DeleteObject'],
  filter: {
    prefix: 'filterdir/',
    suffix: '.jpg',
  },
})
```

## 事件结构

OSS 消息返回的结构如下，在 `FC.OSSEvent` 类型中有描述。

```json
{
  "events": [
    {
      "eventName": "ObjectCreated:PutObject",
      "eventSource": "acs:oss",
      "eventTime": "2017-04-21T12:46:37.000Z",
      "eventVersion": "1.0",
      "oss": {
        "bucket": {
          "arn": "acs:oss:cn-shanghai:123456789:bucketname",
          "name": "testbucket",
          "ownerIdentity": "123456789",
          "virtualBucket": ""
        },
        "object": {
          "deltaSize": 122539,
          "eTag": "688A7BF4F233DC9C88A80BF985AB7329",
          "key": "image/a.jpg",
          "size": 122539
        },
        "ossSchemaVersion": "1.0",
        "ruleId": "9adac8e253828f4f7c0466d941fa3db81161e853"
      },
      "region": "cn-shanghai",
      "requestParameters": {
        "sourceIPAddress": "140.205.128.221"
      },
      "responseElements": {
        "requestId": "58F9FF2D3DF792092E12044C"
      },
      "userIdentity": {
        "principalId": "123456789"
      }
    }
  ]
}
```

## 本地开发

事件类型的函数本地无法使用 dev 开发，只能通过运行 `npm run test` 进行测试执行。

## 本地测试

和 HTTP 测试不同，通过 `createFunctionApp` 创建函数 app，通过 `getServerlessInstance` 获取整个类的实例，从而调用到特定方法来测试。

可以通过 `createOSSEvent` 方法快速创建平台传入的结构。

```typescript
import { createFunctionApp, close } from '@midwayjs/mock';
import { Framework, Application } from '@midwayjs/serverless-app';
import { HelloAliyunService } from '../src/function/hello_aliyun';
import { createOSSEvent, createInitializeContext } from '@midwayjs/serverless-fc-trigger';
import { join } from 'path';

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

  it('should get result from oss trigger', async () => {
    expect(await instance.handleOSSEvent(createOSSEvent())).toEqual('hello world');
  });
});
```

## 注意

- 1、一个 bucket 的一个前缀下只能支持配置一个触发器，如果配置多个会出现 `message: event source 'oss' returned error: Cannot specify overlapping prefix and suffix with same event type.`  的报错
