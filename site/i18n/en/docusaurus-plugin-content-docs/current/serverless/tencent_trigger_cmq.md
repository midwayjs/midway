# CMQ trigger (message queue)

CMQ(mq) triggers subscribe to Tencent Cloud's message queue service.

## Usage

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

After `f deploy`.

:::info
Note that under Tencent Cloud, the default message queue format provided by midway faas is JSON
:::

## CMS trigger configuration

| Attribute name | Type | Description |
| ------ | ------ | -------------------------------------------------------------- |
| topic | string | topic for receiving messages |
| tags | string | optional, which describes the tags of message filtering in the subscription (only messages with consistent tags will be pushed) |

Example:

**Monitor MQ messages**

```typescript
@ServerlessTrigger(ServerlessTriggerType.MQ, {
  topic: 'test-topic',
  region: 'cn-shanghai'
  strategy: 'BACKOFF_RETRY'
})
```

## Event structure

The structure returned by CMQ messages is as follows and is described in the type of `SCF.CMQEvent`.

```json
{
  "Records": [
    {
      "CMQ": {
        "type": "topic ",
        "topicOwner": 1567,
        "topicName": "testtopic",
        "subscriptionName": "xxxxxx ",
        "publishTime": "1970-01-01T00:00:00.000Z ",
        "msgId": "123345346 ",
        "requestId": "123345346 ",
        "msgBody": "Hello from CMQ! ",
        "msgTag": "tag1,tag2"
      }
    }
  ]
}
```

## Local development

You cannot use dev to develop events locally. You can only run the `npm run test` command to run tests.

## Local test

Unlike HTTP testing, the function app is created by `createFunctionApp`, and the instance of the entire class is obtained by `getServerlessInstance`, thus calling a specific method to test.

You can quickly create the structure passed in by the platform by `createCMQEvent` methods.

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
      initContext: createInitializeContext()
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
