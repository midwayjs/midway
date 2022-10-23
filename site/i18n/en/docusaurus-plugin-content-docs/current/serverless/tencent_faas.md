import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Tencent cloud SCF

Serverless Cloud Function (SCF) is a serverless execution environment provided by Tencent Cloud for enterprises and developers to help you run code without purchasing and managing servers. You only need to write the core code in the language supported by the platform and set the conditions under which the code runs to run the code flexibly and safely on the Tencent cloud infrastructure. Cloud functions are ideal computing platforms for real-time file processing and data processing.

The following are common methods for using and testing function triggers.

## Trigger code

<Tabs>
<TabItem value="http" label="API 网关">

API Gateway is similar to HTTP functions in Tencent Cloud Function System, through which we publish functions as HTTP services.

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

</TabItem>

<TabItem value="timer" label="Timer">

A timed task trigger is used to periodically execute a function. Tencent Cloud Timer Trigger currently only supports cron format.

:::info
Warm reminder, please close the trigger in time after testing the function and execute it automatically to avoid over-deduction.
:::

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator';
import { Context, SCF } from '@midwayjs/faas';

@Provide()
export class HelloTencentService {
  @Inject()
  ctx: Context;

  @ServerlessTrigger(ServerlessTriggerType.TIMER, {
    type: 'cron',
    value: '*/60 * * * * * *', // trigger every 60s
  })
  async handleTimerEvent(event: SCF.TimerEvent) {
    this.ctx.logger.info(event);
    return 'hello world';
  }
}
```

Note that Tencent Cloud is set to full Cron. For more information about the Cron format, see [Development documentation](https://cloud.tencent.com/document/product/583/9708).

Common format:

```
*/5 * * * * * indicates that it is triggered every 5 seconds.
0 0 2 1 * * * indicates that it is triggered at 2: 00 a.m. on the 1st of each month.
0 15 10 * * MON-FRI * means it will be triggered at 10:15 a.m. every day from Monday to Friday.
0 0 10,14,16 * * * * means to trigger at 10: 00 a.m., 2: 00 p.m. and 4: 00 p.m. every day
0 */30 9-17 * * * * means every half hour from 9: 00 a.m. to 5: 00 p.m.
0 0 12 * * WED * means to trigger at 12 noon every Wednesday
```

**Timer configuration**

| Attribute name | Type | Description |
| ------- | ------ | ---------------------------------- |
| type | cron | Required, trigger type, representing cron expression.  |
| value | string | Required, cron expression or every value.  |
| payload | string | Optional, a fixed passed value, rarely used |

Example:

**cron expression**

```typescript
@ServerlessTrigger(ServerlessTriggerType.TIMER, {
  type: 'cron',
  value: '0 0 4 * * *', //triggered at 4:00 every day
})
```

**Event structure**

The structure returned by the Timer message is as follows and is described in the `SCF.TimerEvent` type.

```json
{
  Message: '',
  Time: new Date().toJSON()
  TriggerName: 'test',
  Type: 'Timer',
}
```

</TabItem>

<TabItem value="cos" label="COS">

COS is a service used by Tencent Cloud to store some resource files.

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
    events: 'cos:ObjectCreated :*,
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

After `npm run deploy`.

**COS Trigger Configuration**

| Attribute name | Type | Description |
| ------ | ---------------------------------------------------- | ------------------------------------------------------------ |
| bucket | string | The bucket address of the object store. |
| events | string | The name of the event that triggered the execution of the function. |
| Filter | {<br />prefix: string; <br/>suffix: string;<br/>} | the object filtering parameter. only objects that meet the filtering criteria can trigger the function. it contains a configuration property key, which indicates the object key that the filter supports filtering.  |



Example:

**Listener Object Creation Event**

```typescript
  @ServerlessTrigger(ServerlessTriggerType. OS, {
    bucket: 'cli-appid.cos.ap-beijing.myqcloud.com',
    events: 'cos:ObjectCreated :*,
    filter: {
      prefix: 'filterdir /',
      suffix: '.jpg',
    },
  })
```

**Event structure**

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

</TabItem>

<TabItem value="cmq" label="CMQ">

CMQ(mq) triggers subscribe to Tencent Cloud's message queue service.

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

:::info
Note that under Tencent Cloud, the default message queue format provided by midway faas is JSON
:::

**CMS Trigger Configuration**

| Attribute name | Type | Description |
| ------ | ------ | ------------------------------------------------------------ |
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

**Event structure**

The structure returned by CMQ messages is as follows and is described in the type of `SCF.CMQEvent`.

```json
{
  "Records": [
    {
      "CMQ": {
        "type": "topic ",
        "topicOwner": 1567
        "topicName": "testtopic ",
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

</TabItem>

</Tabs>



## Local development

API Gateway types can be developed locally by using the `npm run dev` method similar to traditional applications. Other types of triggers cannot be developed locally by using dev. You can only run `npm run test` to run tests.



## Local test

<Tabs>

<TabItem value="http" label="API 网关">

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

</TabItem>

<TabItem value="timer" label="Timer">

Unlike HTTP testing, the function app is created by `createFunctionApp`, and the instance of the entire class is obtained by `getServerlessInstance`, thus calling a specific method to test.

You can quickly create the structure passed in by the platform by `createTimerEvent` methods.

```typescript
import { createFunctionApp, close } from '@midwayjs/mock';
import { Framework, Application } from '@midwayjs/serverless-app';
import { HelloTencentService } from '../src/function/hello_tencent';
import { createTimerEvent } from '@midwayjs/serverless-scf-trigger';
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
    expect(await instance.handleTimerEvent(createTimerEvent())).toEqual('hello world');
  });
});
```

</TabItem>

<TabItem value="cos" label="COS">

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

</TabItem>

<TabItem value="cmq" label="CMQ">

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

</TabItem>

</Tabs>

## Published to Tencent Cloud SCF

Make sure it is `tencent` at the `provider` paragraph of `f.yml` in the project root directory.

```yaml
service:
  name: midway-faas-examples

provider:
  name: tencent
```

Configuration runtime

```yaml
service:
  name: midway-faas-examples

provider:
  name: tencent
  runtime: nodejs12
```

Configuration function timeout

```yaml
service:
  name: midway-faas-examples

provider:
  name: tencent
  Timeout: 60# Unit Seconds
```

Multiplex HTTP gateway

Tencent Cloud will create a new gateway binding every time HTTP type is deployed. For development, we can reuse the same id

```yaml
service:
  name: midway-faas-examples

provider:
  name: tencent
  serviceId: ********
```

For more information, see [DIP](deploy_tencent_faq#NGqUs).

Run `npm run deploy`. The Deploy command is automatically packaged and released by calling the official deployment tool of Tencent Cloud.

The video flow is as follows:

[Screen recording 2021-03-25 pm 4.47.41.mov](https://www.yuque.com/attachments/yuque/0/2021/mov/501408/1616730670232-05605683-d88e-4e27-a393-9d8f2dfa489f.mov?_lake_card=%7B%22src%22%3A%22https%3A%2F%2Fwww.yuque.com%2Fattachments%2Fyuque%2F0%2F2021%2Fmov%2F501408%2F1616730670232-05605683-d88e-4e27-a393-9d8f2dfa489f.mov%22%2C%22name%22%3A%22%E5%B1%8F%E5%B9%95%E5%BD%95%E5%88%B62021-03-25+%E4%B8%8B%E5%8D%884.47.41.mov%22%2C%22size%22%3A19344722%2C%22type%22%3A%22video%2Fquicktime%22%2C%22ext%22%3A%22mov%22%2C%22status%22%3A%22done%22%2C%22uid%22%3A%221616730664011-0%22%2C%22progress%22%3A%7B%22percent%22%3A99%7D%2C%22percent%22%3A0%2C%22id%22%3A%22dWRP5%22%2C%22card%22%3A%22file%22%7D)



## Frequently Asked Questions

### 1. User authentication

When Tencent Cloud is deployed, if it is the first deployment, the console will display the corresponding two-dimensional code, and the authentication can be completed by scanning the code. The configuration will be reused by default for a single project.

The authentication file is stored in the `.env` file in the root directory of the deployment. If you want to modify the file, you can delete the file and scan the code again.

You can also modify the content in the following format:

```
TENCENT_APP_ID = xxxxxx# AppId of authorized account
TENCENT_SECRET_ID = xxxxxx# SecretId of authorized account
TENCENT_SECRET_KEY = xxxxxx# SecretKey of authorized account
TENCENT_TOKEN = xxxxx# temporary token
```

If you want to use a RAM user to publish a RAM user, you can view the [RAM user permissions](https://cloud.tencent.com/document/product/1154/43006).



### 2. Release area switching

Tencent cloud configuration supports publishing to different regions.

```yaml
service: fc-qinyue-test

provider:
  name: tencent
  runtime: nodejs10
  region: ap-shanghai
```

Common region values are:

- ap-shanghai Shanghai
- ap-guangzhou Guangzhou
- ap-beijing Beijing
- ap-hongkong Hong Kong



For the complete list of regions, see [Tencent Cloud documentation](https://cloud.tencent.com/document/api/583/17238).



### 3. Reuse API Gateway

If the HTTP function is officially released, Tencent Cloud will automatically create a serviceId that identifies the Gateway every time it is released, and there will be many in the long run. In order to reuse each time, it is better to record the serviceId to reuse the following codes after the first release (or apply for a good gateway in advance).

```yaml
service: fc-qinyue-test

provider:
  name: tencent
  runtime: nodejs10
  serviceId: service-xxxxxx # <---- fill in the id here for reuse
```

**Obtain the ID of the API Gateway**

Way one, get from the platform.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588752561344-c520ce4d-8dba-4e88-99c6-744e5af73cb9.png#height=577&id=nPqm4&margin=%5Bobject%20Object%5D&name=image.png&originHeight=577&originWidth=1173&originalType=binary&size=72901&status=done&style=none&width=1173" width="1173" />

Method 2, get after each release.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588752629863-178fd9db-7dcb-496e-af05-1fc68abfb30f.png#height=115&id=iBgEU&margin=%5Bobject%20Object%5D&name=image.png&originHeight=115&originWidth=746&originalType=binary&size=39588&status=done&style=none&width=746" width="746" />

### 4. Bind domain name

After Tencent Cloud is released, it automatically gives a gateway address to access cloud functions, such as `http:// service-xxxxx-xxxxxxxx.gz.apigw.tencentcs.com:80`. At the same time, it automatically maps three sets of environment names and loads them on the path.

- Test environment/test
- Advance/prepub
- Online/release

This address can be seen at both the trigger management of the function and the API gateway.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588752924557-d0eb153e-f583-49c2-b9a4-55e417867b43.png#height=421&id=cPfTl&margin=%5Bobject%20Object%5D&name=image.png&originHeight=578&originWidth=1025&originalType=binary&size=49631&status=done&style=none&width=746" width="746" />

at the gateway.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588752972052-c2f7fbc8-0725-49e0-ab73-5dec6a7c0c00.png#height=732&id=Qw18W&margin=%5Bobject%20Object%5D&name=image.png&originHeight=732&originWidth=3010&originalType=binary&size=238685&status=done&style=none&width=3010" width="3010" />

If we want to remove this environment, we have to bind a custom domain name.

Click "New" at the custom domain name of API Gateway ".

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588753063041-496d876f-3457-47cb-8156-c9e8364e91db.png#height=338&id=mIiB5&margin=%5Bobject%20Object%5D&name=image.png&originHeight=338&originWidth=1096&originalType=binary&size=26777&status=done&style=none&width=1096" width="1096" />

Configure a custom path mapping, such as mapping`/`to the official publishing environment, so that the environment suffix is not required when accessing by a domain name.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588753124170-9e6a2b01-dad8-47df-9d81-294d8397137b.png#height=607&id=FAbTy&margin=%5Bobject%20Object%5D&name=image.png&originHeight=607&originWidth=904&originalType=binary&size=49449&status=done&style=none&width=904" width="904" />

### 5. Additional Billing

When using local tools, due to the SDK provided by Tencent Cloud, a COS Bucket may be created for the storage of code packages. As COS is used for payment, a certain fee will be incurred. Please pay attention to your COS situation in time to avoid deduction.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1606803155279-51e71ffa-6e9a-4ab9-812b-19003d45483c.png#height=460&id=DRD5n&margin=%5Bobject%20Object%5D&name=image.png&originHeight=460&originWidth=1196&originalType=binary&size=60856&status=done&style=none&width=1196" width="1196" />

### 6. Delete Tencent Cloud Gateway Service

After trying out the Tencent cloud service for a period of time, many examples of non-reused gateways will appear because API gateways are not reused every time, as follows.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588749300990-34089754-5fe2-4fb9-942a-0f9f0abc6984.png#height=1226&id=Jo9cX&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1226&originWidth=2778&originalType=binary&size=261243&status=done&style=none&width=2778" width="2778" />

At this time, because the gateway has bound functions, the delete button is gray, and we need to manually delete the resources one by one.

Enter an API gateway instance first.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588749368951-da40aa66-249f-46ac-b208-e7085952c528.png#height=361&id=fA0yx&margin=%5Bobject%20Object%5D&name=image.png&originHeight=942&originWidth=1946&originalType=binary&size=134710&status=done&style=none&width=746" width="746" />

Enter the management API and delete the general API below.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588749549259-fd35cfa1-9e00-42a3-82ff-78f3de23dd85.png#height=930&id=iTseJ&margin=%5Bobject%20Object%5D&name=image.png&originHeight=930&originWidth=2346&originalType=binary&size=122962&status=done&style=none&width=2346" width="2346" />

Go to environmental management and take the environment offline.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588749641386-77ddf012-2b29-46a5-a8dc-6d416d07518e.png#height=770&id=lAclZ&margin=%5Bobject%20Object%5D&name=image.png&originHeight=770&originWidth=2234&originalType=binary&size=134714&status=done&style=none&width=2234" width="2234" />

Go back to the initial list and click Delete.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588749709595-1c47d6e3-08af-42e1-be34-961409f82e1a.png#height=986&id=ZpugG&margin=%5Bobject%20Object%5D&name=image.png&originHeight=986&originWidth=2342&originalType=binary&size=182531&status=done&style=none&width=2342" width="2342" />