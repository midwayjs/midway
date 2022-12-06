import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Aliyun FC

Alibaba Cloud Serverless is one of the first teams in China to provide Serverless computing services. Relying on Alibaba Cloud's powerful cloud infrastructure service capabilities, Alibaba Cloud continues to achieve technological breakthroughs. At present, Taobao, Alipay, DingTalk, Gaud and other enterprises have applied Serverless to the production business. Serverless products on the cloud have successfully landed in tens of thousands of enterprises such as pumpkin movies, Netease Cloud Music, iQiyi sports and Lilith.

Alibaba Cloud Serverless includes many products, such as Function Compute FC and Lightweight Application Engine SAE. This article mainly uses its **Function Compute** part.

The following are common methods for using and testing function triggers.



## Trigger code

<Tabs>
<TabItem value="event" label="Event">

Publish functions that do not contain triggers. This is the simplest type. You can manually trigger parameters directly through event or bind other triggers on the platform.

Bind the event trigger by `@ServerlessTrigger` the decorator directly in the code.

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

</TabItem>

<TabItem value="http" label="HTTP">

Alibaba Cloud's HTTP triggers are different from other platforms. They are another set of triggers that are independent of API Gateway and serve HTTP scenarios. Compared with API gateway, this trigger is easier to use and configure.

Bind HTTP triggers by `@ServerlessTrigger` decorators directly in code.

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator';
import { Context } from '@midwayjs/faas';

@Provide()
export class HelloAliyunService {
  @Inject()
  ctx: Context;

  @ServerlessTrigger(ServerlessTriggerType.HTTP, {
    path: '/',
    method: 'get',
  })
  async handleHTTPEvent(@Query() name = 'midway') {
    return 'hello ${name}';
  }
}
```

</TabItem>

<TabItem value="apigw" label="API 网关">

API Gateway is special in the Alibaba Cloud function system. It is similar to creating a trigger-free function that is bound to a specific path through the platform gateway.

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
    return 'hello ${name}';
  }
}
```

After `npm run deploy`, see [Alibaba Cloud documentation](https://help.aliyun.com/document_detail/74798.html?spm=a2c4g.11186623.6.701.3be978a1MKsNN4).

:::info
The route on the current API gateway is configured on the platform.
:::

</TabItem>

<TabItem value="timer" label="Timer">

A timed task trigger is used to periodically execute a function. There are two ways of timing, every time and cron format.

:::info
Warm reminder, please close the trigger in time after testing the function and execute it automatically to avoid over-deduction.
:::

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator';
import { Context, FC } from '@midwayjs/faas';

@Provide()
export class HelloAliyunService {
  @Inject()
  ctx: Context;

  @ServerlessTrigger(ServerlessTriggerType.TIMER, {
    type: 'cron',
    value: '0 0 4 * * *', // trigger https://help.aliyun.com/document_detail/68172.html at 4:00 every day
  })
  async handleTimerEvent(event: FC.TimerEvent) {
    this.ctx.logger.info(event);
    return 'hello world';
  }
}
```

**Timer configuration**

| Attribute name | Type | Description |
| ------- | ------ | ------------------------------------------------------------ |
| type | string | `cron` or `every`, which is required. The trigger type represents a cron expression at a fixed time interval.  |
| value | string | Required, cron expression or every value. At every time, the minimum time interval is 1 minute, fixed unit minute. |
| payload | string | Optional, a fixed passed value, rarely used |

:::info
Note that FC uses UTC time, which is different from the traditional Chinese time zone.
:::

Example:

**cron expression**

```typescript
@ServerlessTrigger(ServerlessTriggerType.TIMER, {
  type: 'cron',
  value: '0 0 4 * * *', //triggered at 4:00 every day
})
```

You can view the [documentation](https://help.aliyun.com/document_detail/169784.html) of the cron expression.

**every expression**

```typescript
@ServerlessTrigger(ServerlessTriggerType.TIMER, {
  type: 'every',
  value: '5m', // every 5 minutes, minimum 1 minute
})
```

**Event structure**

The structure returned by the Timer message is as follows, described in the `FC.TimerEvent` type.

```json
{
  triggerTime: new Date().toJSON()
  triggerName: 'timer',
  payload: '',
}
```

</TabItem>

<TabItem value="oss" label="OSS">

OSS is used to store some resource files and is a resource storage product of Alibaba Cloud.  When a file is created and updated in OSS, the corresponding function will be triggered and executed.

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator';
import { Context, FC } from '@midwayjs/faas';

@Provide()
export class HelloAliyunService {
  @Inject()
  ctx: Context;

  @ServerlessTrigger(ServerlessTriggerType. OS, {
    bucket: 'ossBucketName',
    events: ['oss:ObjectCreated:*', 'oss:ObjectRemoved:DeleteObject'],
    filter: {
      prefix: 'filterdir /',
      suffix: '.jpg',
    },
  })
  async handleOSSEvent(event: FC.OSSEvent) {
    // xxx
  }
}
```

:::caution

Only one trigger can be configured under one prefix of a bucket. If multiple triggers are configured, the `message: event source'oss' returned error: Canot specify overlapping prefix and suffix with same event type will appear.` The error

:::

**OSS Trigger Configuration**

| Attribute name | Type | Description |
| ------ | ---------------------------------------------------- | ------------------------------------------------------------ |
| bucket | string | The bucket name of the object store. |
| events | string [] | The name of the event that triggered the execution of the function. |
| Filter | {<br />prefix: string; <br/>suffix: string;<br/>} | the object filtering parameter. only objects that meet the filtering criteria can trigger the function. it contains a configuration property key, which indicates the object key that the filter supports filtering.  |



Example:

**Listener events during object creation and object deletion**

```typescript
@ServerlessTrigger(ServerlessTriggerType. OS, {
  bucket: 'ossBucketName',
  events: ['oss:ObjectCreated:*', 'oss:ObjectRemoved:DeleteObject']
  filter: {
    prefix: 'filterdir /',
    suffix: '.jpg',
  },
})
```

**Event structure**

The structure of OSS messages returned is as follows, which is described in the `FC.OSSEvent` type.

```json
{
  "events": [
    {
      "eventName": "ObjectCreated:PutObject ",
      "eventSource": "acs:oss ",
      "eventTime": "2017-04-21T12:46:37.000Z ",
      "eventVersion": "1.0 ",
      "oss": {
        "bucket": {
          "arn": "acs:oss:cn-shanghai:123456789:bucketname ",
          "name": "testbucket ",
          "ownerIdentity": "123456789 ",
          "virtualBucket": ""
        },
        "object": {
          "deltaSize": 122539
          "eTag": "688A7BF4F233DC9C88A80BF985AB7329 ",
          "key": "image/a.jpg ",
          "size": 122539
        },
        "ossSchemaVersion": "1.0 ",
        "ruleId": "9adac8e253828f4f7c0466d941fa3db81161e853"
      },
      "region": "cn-shanghai ",
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

</TabItem>

<TabItem value="mns" label="MNS">

:::info
Please note that Alibaba Cloud Message Queue will incur certain fees for Topic and Queue.
:::

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/decorator';
import { Context, FC } from '@midwayjs/faas';

@Provide()
export class HelloAliyunService {
  @Inject()
  ctx: Context;

  @ServerlessTrigger(ServerlessTriggerType.MQ, {
    topic: 'test-topic',
    tags: 'bbb',
  })
  async handleMNSEvent(event: FC.MNSEvent) {
    // ...
  }
}
```

:::info
Note that under Alibaba Cloud, the default message queue format provided by midway faas is JSON.
:::

**Configure an MNS trigger**

| Attribute name | Type | Description |
| -------- | ------------------------------------------- | ------------------------------------------------------------ |
| topic | string | topic for receiving messages |
| tags | string | optional, which describes the tags of message filtering in the subscription (only messages with consistent tags will be pushed) |
| strategy | "BACKOFF_RETRY" \| "EXPONENTIAL_DECAY_RETRY' | Retry policy for calling function, optional value: BACKOFF_RETRY, EXPONENTIAL_DECAY_RETRY, default value: BACKOFF_RETRY |
| region | string | optional. the region where the topic is located. if not, the default is the same region as the function. |

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

The structure returned by MNS messages is as follows, which is described in the type of `FC.MNSEvent`.

```json
{
  "Context": "user custom info ",
  "TopicOwner": "1186202104331798 ",
  "Message": "hello topic ",
  "Subscriber": "1186202104331798 ",
  "PublishTime": 1550216302888
  "SubscriptionName": "test-fc-subscibe ",
  "MessageMD5": "BA4BA9B48AC81F0F9C66F6C909C39DBB",
  "TopicName": "test-topic ",
  "MessageId": "2F5B3C281B283D4EAC694B7425288675"
}
```

</TabItem>

</Tabs>



## Local development

HTTP triggers and API Gateway types can be developed locally by using local `npm run dev` and similar development methods to traditional applications. Other types of triggers cannot be developed locally by using dev. They can only be tested and executed by running `npm run test`.



## Local test

<Tabs>
<TabItem value="event" label="Event">

Create a function app by `createFunctionApp`, obtain a class instance by `getServerlessInstance`, and then directly call the method of the instance to pass in parameters for testing.

```typescript
describe('test/hello_aliyun.test.ts', () => {
  let app: Application;
  let instance: HelloAliyunService;

  beforeAll(async () => {
    // create app
    app = await createFunctionApp<Framework>(join(__dirname, '../'), {
      initContext: createInitializeContext()
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

</TabItem>

<TabItem value="http" label="HTTP">

Similar to the application, the function app is created by `createFunctionApp` and tested by `createHttpRequest` method.

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
      initContext: createInitializeContext()
    });
  });

  afterAll(async () => {
    await close(app);
  });

  it('should get result from http trigger', async () => {
    const result = await createHttpRequest(app).get('/').query({
      name: 'zhangting',
    });
    expect(result.text).toEqual('hello zhangting');
  });
});
```

</TabItem>

<TabItem value="apigw" label="API 网关">

Same as HTTP testing, the function app is created by `createFunctionApp` and tested by `createHttpRequest` methods.

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
      initContext: createInitializeContext()
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

</TabItem>

<TabItem value="timer" label="Timer">

Unlike HTTP testing, the function app is created by `createFunctionApp`, and the instance of the entire class is obtained by `getServerlessInstance`, thus calling a specific method to test.

You can quickly create the structure passed in by the platform by `createTimerEvent` methods.

```typescript
import { createFunctionApp, close } from '@midwayjs/mock';
import { Framework, Application } from '@midwayjs/serverless-app';
import { HelloAliyunService } from '../src/function/hello_aliyun';
import { createTimerEvent, createInitializeContext } from '@midwayjs/serverless-fc-trigger';
import { join } from 'path';

describe('test/hello_aliyun.test.ts', () => {
  let app: Application;
  let instance: HelloAliyunService;

  beforeAll(async () => {
    // create app
    app = await createFunctionApp<Framework>(join(__dirname, '../'), {
      initContext: createInitializeContext()
    });
    instance = await app.getServerlessInstance<HelloAliyunService>(HelloAliyunService);
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

<TabItem value="oss" label="OSS">

Unlike HTTP testing, the function app is created by `createFunctionApp`, and the instance of the entire class is obtained by `getServerlessInstance`, thus calling a specific method to test.

You can quickly create the structure passed in by the platform by `createOSSEvent` methods.

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
      initContext: createInitializeContext()
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

</TabItem>

<TabItem value="mns" label="MNS">

Unlike HTTP testing, the function app is created by `createFunctionApp`, and the instance of the entire class is obtained by `getServerlessInstance`, thus calling a specific method to test.

You can quickly create the structure passed in by the platform by `createMNSEvent` methods.

```typescript
import { createFunctionApp, close } from '@midwayjs/mock';
import { Framework, Application } from '@midwayjs/serverless-app';
import { HelloAliyunService } from '../src/function/hello_aliyun';
import { createMNSEvent, createInitializeContext } from '@midwayjs/serverless-fc-trigger';
import { join } from 'path';

describe('test/hello_aliyun.test.ts', () => {
  let app: Application;
  let instance: HelloAliyunService;

  beforeAll(async () => {
    // create app
    app = await createFunctionApp<Framework>(join(__dirname, '../'), {
      initContext: createInitializeContext()
    });
    instance = await app.getServerlessInstance<HelloAliyunService>(HelloAliyunService);
  });

  afterAll(async () => {
    await close(app);
  });

  it('should get result from oss trigger', async () => {
    expect(await instance.handleMNSEvent(createMNSEvent())).toEqual('hello world');
  });
});
```

</TabItem>

</Tabs>

## publish to alibaba cloud

Ensure `aliyun` at the `provider` paragraph of `f.yml` in the project root directory.

```yaml
service:
  name: midway-faas-examples

provider:
  name: aliyun
```

Deploy the function. You can directly use the release command to package and deploy the function. The Deploy command is automatically packaged and released by calling the official deployment tool of Alibaba Cloud.

```shell
$ npm run deploy
```

:::info
If you enter the wrong information, you can re-execute the `npx midway-bin deploy -- resetConfig` modification.
:::

For the first time, Alibaba Cloud deployment needs to configure `accountId`, `accountKey`, and `accountSecret`.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1585718654967-11e1bcbd-5a56-4239-99e1-5a1472ad49fd.png#align=left&display=inline&height=514&margin=%5Bobject%20Object%5D&originHeight=514&originWidth=1152&size=0&status=done&style=none&width=1152" width="1152" />

For related configuration, please refer to the picture below:

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1585718654949-9c14958c-3aff-403a-b89b-d03a3a95cd18.png#align=left&display=inline&height=696&margin=%5Bobject%20Object%5D&originHeight=696&originWidth=1832&size=0&status=done&style=none&width=1832" width="1832" />

Click [Security Settings](https://account.console.aliyun.com/#/secure).



<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1585718654950-19a811c5-2cf3-4843-a619-cfd744430fae.png#align=left&display=inline&height=184&margin=%5Bobject%20Object%5D&originHeight=592&originWidth=2406&size=0&status=done&style=none&width=746" width="746" />

Click the [AccessKey page](https://usercenter.console.aliyun.com/#/manage/ak) of Alibaba Cloud.

Here is an example of an http trigger.

After the release, Alibaba Cloud will output a temporarily available domain name and open the browser to access it.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1600835297676-1753de7a-fb0d-46ca-98f0-944eba5b2f2b.png#align=left&display=inline&height=193&margin=%5Bobject%20Object%5D&name=image.png&originHeight=193&originWidth=1219&size=35152&status=done&style=none&width=1219" width="1219" />

After the release is completed, the platform status is as follows.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1586685106514-c52880d4-c447-4bc1-9b8b-6db99dd81878.png#height=436&id=wtVSC&margin=%5Bobject%20Object%5D&name=image.png&originHeight=872&originWidth=2684&originalType=binary&size=164942&status=done&style=none&width=1342" width="1342" />

release effect, each configured function will be published as a function on the platform, and the http trigger will be automatically configured.



## Frequently Asked Questions

### 1. Custom domain name

You need to apply for a domain name in advance. If you are in China, you need to file it, otherwise you cannot bind it.

The first step is to turn off the function of the default automatically generated domain name

```yaml
service:
  name: midway-faas-examples

provider:
  name: aliyun

custom:
  customDomain: false
```

The second step is to add domain name resolution to the gateway corresponding to your function.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588654519449-2c98a9d8-ffac-42b7-bcf2-ac19c21f08ac.png#height=478&id=kmxTj&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1090&originWidth=1700&originalType=binary&size=132002&status=done&style=none&width=746" width="746" />

Bind a custom domain name on the function page and add a route

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588654440214-75bfd1c2-1b6a-4c2b-9c57-198bec9d4e64.png#height=706&id=IEhZC&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1412&originWidth=2794&originalType=binary&size=310772&status=done&style=none&width=1397" width="1397" />

After the binding is completed, you can use the domain name to access.

### 2. Some restrictions on http headers

Request Headers does not support customization starting with x-fc-and customization of the following fields:

- accept-encoding
- connection
- keep-alive
- proxy-authorization
- te
- trailer
- transfer-encoding

Response Headers does not support customization starting with `x-fc-` and customization of the following fields:

- connection
- content-length
- content-encoding
- date
- keep-alive
- proxy-authenticate
- server
- trailer
- transfer-encoding
- upgrade

Request restrictions. If the following limit is exceeded, the 400 status code and InvalidArgument error code will be returned.

- Headers Size: The total size of all Key and Value in the Headers must not exceed 4KB.
- Path size: Including all Query Params, the total size of Path must not exceed 4KB.
- Body size: The total size of HTTP Body must not exceed 6MB.

Response restrictions. If the following limit is exceeded, the 502 status code and BadResponse error code will be returned.

- Headers Size: The total size of all Key and Value in the Headers must not exceed 4KB.



### 3. The size of the release package

In order to improve the startup speed, the Alibaba Cloud FC container limits the size of the compressed package to 50M. Please simplify your back-end code dependencies as much as possible.

Generally speaking, the default scaffold (eggjs) of midway is built at about 9M, and other frameworks will be smaller. Please try to delete the `package-lock.json` before trying.

### 4. Container time zone problem

> Most Docker images are based on Alpine,Ubuntu,Debian,CentOS and other basic images.  Basically, UTC time is used, and the default time zone is zero time zone.

The default time zone of Alibaba Cloud container environment is `GMT +0000`. When you use the `new Date()` and other frontend users to obtain the time zone, the time zone may not be processed by domestic users, and the difference will be 8 hours.

Domestic users may be accustomed to `GMT +0800` by default. Can be adjusted by environment variables (configured on platform or f.yml).

```json
process.env.TZ = 'Asia/Shanghai';
```

```yaml
provider:
  name: aliyun
  runtime: nodejs12
	environment:
  	TZ: 'Asia/Shanghai'
```

:::info
Note that the scheduled task is triggered by the gateway and will not be affected by the function time zone configured here.
:::

### 5. Revised AccessKey

Sometimes, we fill in a wrong `AccessKey` or other regional options on the first release. We provide a modifiable parameter to clean up the last error on the release.

```bash
midway-bin deploy --resetConfig
```

Enter default when prompted `Please create alias for key pair. If not, please enter to skip`, otherwise the current AccessKey will not be used. If you only want to adjust specific fields, you can enter the `~/.s/access.yaml` file, modify and save directly.

### 6. CLI Releases Red Tips

After the HTTP trigger is published, the following red prompt will appear. This is **a prompt** because if the domain name is not configured, Alibaba Cloud will add the `Content-Disposition: attachment` the header to the response by default, and the browser opening address will change to attachment download. You can test the results by binding a custom domain name or a local curl.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1587036400388-b2ebe43f-fa7d-463b-b9b6-b38bf9e18430.png#height=268&id=H2BJz&margin=%5Bobject%20Object%5D&name=image.png&originHeight=268&originWidth=958&originalType=binary&ratio=1&size=242934&status=done&style=none&width=958" width="958" />

### 7. Specify accessKey at the time of release, etc.

```bash
export REGION=cn-beijing
export ACCOUNT_ID=xxx
export ACCESS_KEY_ID=xxx
export ACCESS_KEY_SECRET=xxx
```

currently, alibaba cloud releases using funcraft tools. you can use the funcraft environment variables, load the startup command line, or use the yml variable filling method.

### 8. Release Timeout

Sometimes the package is relatively large, and the upload of `midway-bin deploy` may encounter the problem of timeout, which is controlled internally by the funcraft tool.

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1598423950078-15838cbb-95f3-41f9-94ac-a31741b111d3.png#height=179&id=EOCLm&margin=%5Bobject%20Object%5D&name=image.png&originHeight=358&originWidth=2784&originalType=binary&ratio=1&size=310195&status=done&style=none&width=1392" width="1392" />

Solution: Configure timeout in `~/.fcli/config.yaml` in s (seconds).

Generally speaking, the default scaffold (eggjs) of midway is built at about 9M, and other frameworks will be smaller. Please try to delete the `package-lock.json` before trying.

If there is no effect, if the package is too large, you can modify the deployment time of the fun tool in `~/.fcli/config.yaml`, and add the timeout field to it.

Examples are as follows:

```typescript
endpoint: ***************
api_version: '2016-08-15'
access_key_id: ***************
access_key_secret: * * * * * * * * * * * * * * *
security_token: ''
debug: false
timeout: 50 ## deployment timeout, unit is s
retries: 3

```

