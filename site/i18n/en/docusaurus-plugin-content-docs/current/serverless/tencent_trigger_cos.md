# COS Triggers (Object Storage)

COS is a service used by Tencent Cloud to store some resource files.

## Usage

```typescript
import {
  Provide
  Inject
  ServerlessTrigger
  ServerlessTriggerType
} from '@midwayjs/decorator';
import { Context, SCF } from '@midwayjs/faas';

@Provide()
export class HelloTencentService {
  @Inject()
  ctx: Context;

  @ServerlessTrigger(ServerlessTriggerType. OS, {
    bucket: 'cli-appid.cos.ap-beijing.myqcloud.com',
    events: 'cos:ObjectCreated:*',
    filter: {
      prefix: 'filterdir /',
      suffix: '.jpg',
    },
  })
  async handleCOSEvent(event: SCF.COSEvent) {
    // xxx
  }
}
```

Run `npm run deploy`.

## COS trigger configuration

| Attribute name | Type | Description |
| ------ | ------ | ---------------------- |
| bucket | string | The bucket address of the object store. |
| events | string | The name of the event that triggered the execution of the function. |
| Filter | {<br />prefix: string; <br/>suffix: string;<br/>} | the object filtering parameter. only objects that meet the filtering criteria can trigger the function. it contains a configuration property key, which indicates the object key that the filter supports filtering.  |



Example:

**Listener Object Creation Event**

```typescript
  @ServerlessTrigger(ServerlessTriggerType. OS, {
    bucket: 'cli-appid.cos.ap-beijing.myqcloud.com',
    events: 'cos:ObjectCreated:*',
    filter: {
      prefix: 'filterdir /',
      suffix: '.jpg',
    },
  })
```

## Event structure

The structure returned by COS messages is as follows, which is described in the type of `SCF.COSEvent`.

```json
{
  "Records": [
    {
      "cos": {
        "cosSchemaVersion": "1.0 ",
        "cosObject": {
          "url": "http://testpic-1253970026.cos.ap-chengdu.myqcloud.com/testfile ",
          "meta": {
            "x-cos-request-id": "NWMxOWY4MGFfMjViMjU4NjRfMTUyMV8yNzhhZjM =",
            "Content-Type": ""
          },
          "vid": "",
          "key": "",
          "size": 1029
        },
        "cosBucket": {
          "region": "cd ",
          "name": "testpic ",
          "appid": "1253970026"
        },
        "cosNotificationId": "unkown"
      },
      "event": {
        "eventName": "cos:ObjectCreated :*",
        "eventVersion": "1.0 ",
        "eventTime": 1545205770
        "eventSource": "qcs::cos ",
        "requestParameters": {
          "requestSourceIP": "192.168.15.101 ",
          "requestHeaders": {
            "Authorization": "****************"
          }
        },
        "eventQueue": "qcs:0:lambda:cd:appid/1253970026:default.printevent.$LATEST ",
        "reservedInfo": "",
        "reqid": 179398952
      }
    }
  ]
}
```



## Local development

You cannot use dev to develop events locally. You can only run the `npm run test` command to run tests.

## Local test

Unlike HTTP testing, the function app is created by `createFunctionApp`, and the instance of the entire class is obtained by `getServerlessInstance`, thus calling a specific method to test.

You can quickly create the structure passed in by the platform by `createCOSEvent` methods.

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
