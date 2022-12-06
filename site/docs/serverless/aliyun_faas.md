import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 阿里云 FC

阿里云 Serverless 是国内最早提供 Serverless 计算服务的团队之一, 依托于阿里云强大的云基础设施服务能力，不断实现技术突破。目前，淘宝、支付宝、钉钉、高德等已经将 Serverless 应用于生产业务，云上的 Serverless 产品在南瓜电影、网易云音乐、爱奇艺体育、莉莉丝等数万家企业成功落地。

阿里云 Serverless 包含许多产品，如函数计算 FC，轻量应用引擎 SAE 等，本文主要使用了其 **函数计算** 部分。

下面是常见的函数触发器的使用和测试方法。



## 触发器代码

<Tabs>
<TabItem value="event" label="Event">

发布不包含触发器的函数，这是最简单的类型，可以直接通过 event 手动触发参数，也可以在平台绑定其他触发器。

通过直接在代码中的 `@ServerlessTrigger` 装饰器绑定事件触发器。

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

阿里云的 HTTP 触发器和其他平台的有所区别，是独立于 API 网关的另一套服务于 HTTP 场景的触发器。相比于 API 网关，该触发器更易于使用和配置。

通过直接在代码中的 `@ServerlessTrigger` 装饰器绑定 HTTP 触发器。

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
    return `hello ${name}`;
  }
}
```

</TabItem>

<TabItem value="apigw" label="API 网关">

API 网关在阿里云函数体系中比较特殊，他类似于创建一个无触发器函数，通过平台网关的绑定到特定的路径上。

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

在 `npm run deploy` 后，参考 [阿里云文档](https://help.aliyun.com/document_detail/74798.html?spm=a2c4g.11186623.6.701.3be978a1MKsNN4) 配置即可。

:::info
当前 API 网关线上的路由在平台进行配置。
:::

</TabItem>

<TabItem value="timer" label="Timer">

定时任务触发器用于定时执行一个函数。定时有两种方式，时间间隔（every）和 cron 格式。

:::info
温馨提醒，测试函数后请及时关闭触发器自动执行，避免超额扣费。
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
    value: '0 0 4 * * *', // 每天4:00触发  https://help.aliyun.com/document_detail/68172.html
  })
  async handleTimerEvent(event: FC.TimerEvent) {
    this.ctx.logger.info(event);
    return 'hello world';
  }
}
```

**Timer 配置**

| 属性名  | 类型   | 描述                                                         |
| ------- | ------ | ------------------------------------------------------------ |
| type    | string | `cron` 或者 `every`，必填，触发类型，分别代表 cron 表达式，固定时间间隔。 |
| value   | string | 必填，cron 表达式或者 every 的值。every 时最小时间间隔 1 分钟，固定单位分钟 |
| payload | string | 可选，一个固定传递的值，很少用                               |

:::info
注意，FC 使用的是 UTC 时间，和传统的中国时区不同。
:::

示例：

**cron 表达式**

```typescript
@ServerlessTrigger(ServerlessTriggerType.TIMER, {
  type: 'cron',
  value: '0 0 4 * * *', // 每天4:00触发
})
```

cron 表达式可以查看 [文档](https://help.aliyun.com/document_detail/169784.html)。

**every 表达式**

```typescript
@ServerlessTrigger(ServerlessTriggerType.TIMER, {
  type: 'every',
  value: '5m', // 每隔 5 分钟，最小为 1 分钟
})
```

**事件结构**

Timer 消息返回的结构如下，在 `FC.TimerEvent` 类型中有描述。

```json
{
  triggerTime: new Date().toJSON(),
  triggerName: 'timer',
  payload: '',
}
```

</TabItem>

<TabItem value="oss" label="OSS">

OSS 用于存储一些资源文件，是阿里云的资源存储产品。 当 OSS 中有文件创建，更新，对应的函数就会被触发而执行。

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

:::caution

一个 bucket 的一个前缀下只能支持配置一个触发器，如果配置多个会出现 `message: event source 'oss' returned error: Cannot specify overlapping prefix and suffix with same event type.` 的报错

:::

**OSS 触发器配置**

| 属性名 | 类型                                                 | 描述                                                         |
| ------ | ---------------------------------------------------- | ------------------------------------------------------------ |
| bucket | string                                               | 对象存储的 bucket 名                                         |
| events | string[]                                             | 触发函数执行的事件名                                         |
| filter | {<br />prefix: string;<br/>   suffix: string;<br/> } | 对象过滤参数，满足过滤条件的 对象才可以触发函数，包含一个配置属性 key，表示过滤器支持过滤的对象键 (key)。 |



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

**事件结构**

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

</TabItem>

<TabItem value="mns" label="MNS">

:::info
请务必注意，阿里云消息队列会对 Topic 和 Queue 产生一定的费用。
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
注意，在阿里云下，midway faas 提供的默认消息队列格式为 JSON
:::

**MNS 触发器配置**

| 属性名   | 类型                                        | 描述                                                         |
| -------- | ------------------------------------------- | ------------------------------------------------------------ |
| topic    | string                                      | 接收消息的 topic                                             |
| tags     | string                                      | 可选，描述了该订阅中消息过滤的标签（标签一致的消息才会被推送） |
| strategy | 'BACKOFF_RETRY' \|'EXPONENTIAL_DECAY_RETRY' | 调用函数的重试策略，可选值：BACKOFF_RETRY, EXPONENTIAL_DECAY_RETRY, 默认值为: BACKOFF_RETRY |
| region   | string                                      | 可选，topic 所在的 region，如果不填，默认为和函数一样的 region |

示例：

**监听 MQ 消息**

```typescript
@ServerlessTrigger(ServerlessTriggerType.MQ, {
  topic: 'test-topic',
  region: 'cn-shanghai'
  strategy: 'BACKOFF_RETRY'
})
```

**事件结构**

MNS 消息返回的结构如下，在 `FC.MNSEvent` 类型中有描述。

```json
{
  "Context": "user custom info",
  "TopicOwner": "1186202104331798",
  "Message": "hello topic",
  "Subscriber": "1186202104331798",
  "PublishTime": 1550216302888,
  "SubscriptionName": "test-fc-subscibe",
  "MessageMD5": "BA4BA9B48AC81F0F9C66F6C909C39DBB",
  "TopicName": "test-topic",
  "MessageId": "2F5B3C281B283D4EAC694B7425288675"
}
```

</TabItem>

</Tabs>



## 本地开发

HTTP 触发器和 API Gateway 类型可以通过本地 `npm run dev` 和传统应用类似的开发方式进行本地开发，其他类型的触发器本地无法使用 dev 开发，只能通过运行 `npm run test` 进行测试执行。



## 本地测试

<Tabs>
<TabItem value="event" label="Event">

通过 `createFunctionApp` 创建函数 app，通过 `getServerlessInstance` 获取类实例，然后通过实例的方法直接调用，传入参数进行测试。

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

</TabItem>

<TabItem value="http" label="HTTP">

和应用类似相同，通过 `createFunctionApp` 创建函数 app，通过 `createHttpRequest` 方式进行测试。

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
    const result = await createHttpRequest(app).get('/').query({
      name: 'zhangting',
    });
    expect(result.text).toEqual('hello zhangting');
  });
});
```

</TabItem>

<TabItem value="apigw" label="API 网关">

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

</TabItem>

<TabItem value="timer" label="Timer">

和 HTTP 测试不同，通过 `createFunctionApp` 创建函数 app，通过 `getServerlessInstance` 获取整个类的实例，从而调用到特定方法来测试。

可以通过 `createTimerEvent` 方法快速创建平台传入的结构。

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
      initContext: createInitializeContext(),
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

</TabItem>

<TabItem value="mns" label="MNS">

和 HTTP 测试不同，通过 `createFunctionApp` 创建函数 app，通过 `getServerlessInstance` 获取整个类的实例，从而调用到特定方法来测试。

可以通过 `createMNSEvent` 方法快速创建平台传入的结构。

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
      initContext: createInitializeContext(),
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

## 发布到阿里云

在项目根目录的 `f.yml` 的 `provider` 段落处确保为 `aliyun` 。

```yaml
service:
  name: midway-faas-examples

provider:
  name: aliyun
```

部署函数，直接使用发布命令即可打包并部署函数，Deploy 命令会自动打包，并调用阿里云官方部署工具发布。

```shell
$ npm run deploy
```

:::info
如果输错了信息，可以重新执行 `npx midway-bin deploy --resetConfig` 修改。
:::

阿里云部署首次需要配置 `accountId`、`accountKey`、`accountSecret`

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1585718654967-11e1bcbd-5a56-4239-99e1-5a1472ad49fd.png#align=left&display=inline&height=514&margin=%5Bobject%20Object%5D&originHeight=514&originWidth=1152&size=0&status=done&style=none&width=1152" width="1152" />

相关配置获取，可参照下方图片：

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1585718654949-9c14958c-3aff-403a-b89b-d03a3a95cd18.png#align=left&display=inline&height=696&margin=%5Bobject%20Object%5D&originHeight=696&originWidth=1832&size=0&status=done&style=none&width=1832" width="1832" />

点击此处跳转阿里云[安全设置页](https://account.console.aliyun.com/#/secure)。



<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1585718654950-19a811c5-2cf3-4843-a619-cfd744430fae.png#align=left&display=inline&height=184&margin=%5Bobject%20Object%5D&originHeight=592&originWidth=2406&size=0&status=done&style=none&width=746" width="746" />

点击跳转阿里云个人 [AccessKey 页面](https://usercenter.console.aliyun.com/#/manage/ak)。

这里以 http 触发器作为示例。

发布后，阿里云会输出一个临时可用的域名，打开浏览器访问即可。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1600835297676-1753de7a-fb0d-46ca-98f0-944eba5b2f2b.png#align=left&display=inline&height=193&margin=%5Bobject%20Object%5D&name=image.png&originHeight=193&originWidth=1219&size=35152&status=done&style=none&width=1219" width="1219" />

发布完成后，平台状态如下。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1586685106514-c52880d4-c447-4bc1-9b8b-6db99dd81878.png#height=436&id=wtVSC&margin=%5Bobject%20Object%5D&name=image.png&originHeight=872&originWidth=2684&originalType=binary&size=164942&status=done&style=none&width=1342" width="1342" />

发布效果，每个配置的函数都将发布成一个平台上的函数，并且自动配置 http 触发器。



## 常见问题

### 1、自定义域名

你需要提前申请一个域名，在国内的话，需要备案，否则无法绑定。

第一步，先将默认自动生成的域名的功能关闭

```yaml
service:
  name: midway-faas-examples

provider:
  name: aliyun

custom:
  customDomain: false
```

第二步，添加域名解析到你函数对应网关。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588654519449-2c98a9d8-ffac-42b7-bcf2-ac19c21f08ac.png#height=478&id=kmxTj&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1090&originWidth=1700&originalType=binary&size=132002&status=done&style=none&width=746" width="746" />

在函数页面绑定自定义域名，添加路由

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588654440214-75bfd1c2-1b6a-4c2b-9c57-198bec9d4e64.png#height=706&id=IEhZC&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1412&originWidth=2794&originalType=binary&size=310772&status=done&style=none&width=1397" width="1397" />

绑定完成后，即可用域名访问。

### 2、http 头的一些限制

Request Headers 不支持以 x-fc-开头的自定义及以下字段的自定义：

- accept-encoding
- connection
- keep-alive
- proxy-authorization
- te
- trailer
- transfer-encoding

Response Headers 不支持以 `x-fc-` 开头的自定义及以下字段的自定义：

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

Request 限制项。如果超过以下限制，会返回 400 状态码和 InvalidArgument 错误码。

- Headers 大小：Headers 中的所有 Key 和 Value 的总大小不得超过 4 KB。
- Path 大小：包括所有的 Query Params，Path 的总大小不得超过 4 KB。
- Body 大小：HTTP Body 的总大小不得超过 6 MB。

Response 限制项。如果超过以下限制，会返回 502 状态码和 BadResponse 错误码。

- Headers 大小：Headers 中的所有 Key 和 Value 的总大小不得超过 4 KB。



### 3、发布包大小问题

为了提升启动速度，阿里云 FC 容器限制压缩包大小为 50M，请尽可能精简你的后端代码依赖。

一般来说，midway 默认脚手架（eggjs）构建完在 9M 左右，其他框架会更小，请尝试先删除 `package-lock.json` 后再尝试。

### 4、容器时区问题

> 大部分 Docker 镜像都是基于 Alpine，Ubuntu，Debian，CentOS 等基础镜像制作而成。 基本上都采用 UTC 时间，默认时区为零时区。

阿里云容器环境的时区默认是 `GMT +0000`，直接使用 `new Date()` 等前端获取的时候，国内的用户可能未作时区处理，会相差 8 个小时。

国内用户使用，默认可能习惯 `GMT +0800` 。可以通过环境变量调整（配置在平台或者 f.yml）。

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
注意，定时任务由网关触发，不会受到这里配置的函数时区影响。
:::

### 5、修改 AccessKey

有时候，我们在第一次发布时会填错一个 AccessKey，或者其他区域选项，我们提供了一个 可以修改的参数，用于在发布时清理上次错误的选项。

```bash
midway-bin deploy --resetConfig
```

这里提示 `Please create alias for key pair. If not, please enter to skip` 时输入 default，否则不会使用当前的 AccessKey。如果只希望调整特定字段，可以进入 `~/.s/access.yaml` 文件中，直接修改保存。

### 6、CLI 发布红色提示

在 HTTP 触发器发布后，会出现下面的红色提示。这是**一个提示**，原因为，未配置域名的情况下，阿里云将默认添加 `Content-Disposition: attachment` 头到响应中，浏览器打开地址会变为附件下载。可以通过绑定自定义域名或者本地 curl 的方式来测试结果。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1587036400388-b2ebe43f-fa7d-463b-b9b6-b38bf9e18430.png#height=268&id=H2BJz&margin=%5Bobject%20Object%5D&name=image.png&originHeight=268&originWidth=958&originalType=binary&ratio=1&size=242934&status=done&style=none&width=958" width="958" />

### 7、发布时指定 accessKey 等

```bash
export REGION=cn-beijing
export ACCOUNT_ID=xxx
export ACCESS_KEY_ID=xxx
export ACCESS_KEY_SECRET=xxx
```

当前阿里云发布使用的是 funcraft 工具，可以使用 funcraft 的环境变量，可以加载启动的命令行前，也可以使用 yml 的变量填充方式。

### 8、发布超时问题

有时候包比较大， `midway-bin deploy` 上传可能会碰到超时的问题，这个超时时间是 funcraft 工具内部控制的。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1598423950078-15838cbb-95f3-41f9-94ac-a31741b111d3.png#height=179&id=EOCLm&margin=%5Bobject%20Object%5D&name=image.png&originHeight=358&originWidth=2784&originalType=binary&ratio=1&size=310195&status=done&style=none&width=1392" width="1392" />

解决方案： `~/.fcli/config.yaml` 里面配置 timeout，单位是 s（秒）。

一般来说，midway 默认脚手架（eggjs）构建完在 9M 左右，其他框架会更小，请尝试先删除 `package-lock.json` 后再尝试。

如无效果，确实是包过大，可以修改 fun 工具的部署时间，位置为 `~/.fcli/config.yaml` ，在其中增加 timeout 字段。

示例如下：

```typescript
endpoint: ***************
api_version: '2016-08-15'
access_key_id: ***************
access_key_secret: ***************
security_token: ''
debug: false
timeout: 50      ## 部署超时时间，单位为 s
retries: 3

```

