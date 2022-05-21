import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 腾讯云 SCF

云函数（Serverless Cloud Function，SCF）是腾讯云为企业和开发者们提供的无服务器执行环境，帮助您在无需购买和管理服务器的情况下运行代码。您只需使用平台支持的语言编写核心代码并设置代码运行的条件，即可在腾讯云基础设施上弹性、安全地运行代码。云函数是实时文件处理和数据处理等场景下理想的计算平台。

下面是常见的函数触发器的使用和测试方法。

## 触发器代码

<Tabs>
<TabItem value="http" label="API 网关">

API 网关在腾讯云函数体系中类似于 HTTP 函数，我们通过它将函数发布为 HTTP 服务。

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
    return `hello ${name}`;
  }
}
```

在 `npm run deploy` 后即可通过控制台输出的链接访问。

</TabItem>

<TabItem value="timer" label="Timer">

定时任务触发器用于定时执行一个函数。腾讯云 Timer 触发器目前只支持 cron 格式。

:::info
温馨提醒，测试函数后请及时关闭触发器自动执行，避免超额扣费。
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
    value: '*/60 * * * * * *', // 每 60s 触发
  })
  async handleTimerEvent(event: SCF.TimerEvent) {
    this.ctx.logger.info(event);
    return 'hello world';
  }
}
```

注意，腾讯云的定时为全 Cron，具体 Cron 格式请参考 [开发文档](https://cloud.tencent.com/document/product/583/9708)。

常用格式：

```
*/5 * * * * * * 表示每5秒触发一次
0 0 2 1 * * * 表示在每月的1日的凌晨2点触发
0 15 10 * * MON-FRI * 表示在周一到周五每天上午10：15触发
0 0 10,14,16 * * * * 表示在每天上午10点，下午2点，4点触发
0 */30 9-17 * * * * 表示在每天上午9点到下午5点每半小时触发
0 0 12 * * WED * 表示在每个星期三中午12点触发
```

**Timer 配置**

| 属性名  | 类型   | 描述                               |
| ------- | ------ | ---------------------------------- |
| type    | cron   | 必填，触发类型，代表 cron 表达式。 |
| value   | string | 必填，cron 表达式或者 every 值。   |
| payload | string | 可选，一个固定传递的值，很少用     |

示例：

**cron 表达式**

```typescript
@ServerlessTrigger(ServerlessTriggerType.TIMER, {
  type: 'cron',
  value: '0 0 4 * * *', // 每天4:00触发
})
```

**事件结构**

Timer 消息返回的结构如下，在 `SCF.TimerEvent` 类型中有描述。

```json
{
  Message: '',
  Time: new Date().toJSON(),
  TriggerName: 'test',
  Type: 'Timer',
}
```

</TabItem>

<TabItem value="cos" label="COS">

COS 是腾讯云用于存储一些资源文件的服务。

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

**COS 触发器配置**

| 属性名 | 类型                                                 | 描述                                                         |
| ------ | ---------------------------------------------------- | ------------------------------------------------------------ |
| bucket | string                                               | 对象存储的 bucket 地址                                       |
| events | string                                               | 触发函数执行的事件名                                         |
| filter | {<br />prefix: string;<br/>   suffix: string;<br/> } | 对象过滤参数，满足过滤条件的 对象才可以触发函数，包含一个配置属性 key，表示过滤器支持过滤的对象键 (key)。 |



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

**事件结构**

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

</TabItem>

<TabItem value="cmq" label="CMQ">

CMQ（mq） 触发器，订阅的是腾讯云的消息队列服务。

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
注意，在腾讯云下，midway faas 提供的默认消息队列格式为 JSON
:::

**CMS 触发器配置**

| 属性名 | 类型   | 描述                                                         |
| ------ | ------ | ------------------------------------------------------------ |
| topic  | string | 接收消息的 topic                                             |
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

**事件结构**

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

</TabItem>

</Tabs>



## 本地开发

API 网关类型可以通过本地 `npm run dev` 和传统应用类似的开发方式进行本地开发，其他类型的触发器本地无法使用 dev 开发，只能通过运行 `npm run test` 进行测试执行。



## 本地测试

<Tabs>

<TabItem value="http" label="API 网关">

和传统应用 HTTP 测试相同，通过 createFunctionApp 创建函数 app，通过 createHttpRequest 方式进行测试。

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

和 HTTP 测试不同，通过 `createFunctionApp` 创建函数 app，通过 `getServerlessInstance` 获取整个类的实例，从而调用到特定方法来测试。

可以通过 `createTimerEvent` 方法快速创建平台传入的结构。

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

</TabItem>

<TabItem value="cmq" label="CMQ">

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

</TabItem>

</Tabs>

## 发布到腾讯云 SCF

在项目根目录的 `f.yml` 的 `provider` 段落处确保为 `tencent`。

```yaml
service:
  name: midway-faas-examples

provider:
  name: tencent
```

配置运行时

```yaml
service:
  name: midway-faas-examples

provider:
  name: tencent
  runtime: nodejs12
```

配置函数超时

```yaml
service:
  name: midway-faas-examples

provider:
  name: tencent
  timeout: 60 # 单位秒
```

复用 HTTP 网关

腾讯云在每次部署 HTTP 类型时，都会创建一个新的网关绑定，对于开发时，我们可以复用同一个 id

```yaml
service:
  name: midway-faas-examples

provider:
  name: tencent
  serviceId: ********
```

具体写法可以参考 [复用网关 id](deploy_tencent_faq#NGqUs)。

执行 `npm run deploy` 即可，Deploy 命令会自动打包，并调用腾讯云官方部署工具发布。

视频流程如下：

[屏幕录制 2021-03-25 下午 4.47.41.mov](https://www.yuque.com/attachments/yuque/0/2021/mov/501408/1616730670232-05605683-d88e-4e27-a393-9d8f2dfa489f.mov?_lake_card=%7B%22src%22%3A%22https%3A%2F%2Fwww.yuque.com%2Fattachments%2Fyuque%2F0%2F2021%2Fmov%2F501408%2F1616730670232-05605683-d88e-4e27-a393-9d8f2dfa489f.mov%22%2C%22name%22%3A%22%E5%B1%8F%E5%B9%95%E5%BD%95%E5%88%B62021-03-25+%E4%B8%8B%E5%8D%884.47.41.mov%22%2C%22size%22%3A19344722%2C%22type%22%3A%22video%2Fquicktime%22%2C%22ext%22%3A%22mov%22%2C%22status%22%3A%22done%22%2C%22uid%22%3A%221616730664011-0%22%2C%22progress%22%3A%7B%22percent%22%3A99%7D%2C%22percent%22%3A0%2C%22id%22%3A%22dWRP5%22%2C%22card%22%3A%22file%22%7D)



## 常见问题

### 1、用户鉴权

腾讯云在部署时，如果是首次部署，则控制台会展示相应二维码，扫码即可完成认证，单项目后续会默认复用该配置。

鉴权文件保存在部署的根目录下的 `.env`  文件，如果要修改，可以删除该文件重新扫码。

也可以修改其中的内容，格式如下：

```
TENCENT_APP_ID=xxxxxx     #授权账号的 AppId
TENCENT_SECRET_ID=xxxxxx  #授权账号的 SecretId
TENCENT_SECRET_KEY=xxxxxx #授权账号的 SecretKey
TENCENT_TOKEN=xxxxx       #临时 token
```

如果需要使用子账号发布，请查询 [子账号权限配置文档](https://cloud.tencent.com/document/product/1154/43006)。



### 2、发布区域切换

腾讯云配置支持发布到不同的区域。

```yaml
service: fc-qinyue-test

provider:
  name: tencent
  runtime: nodejs10
  region: ap-shanghai
```

常见的 region 值有：

- ap-shanghai 上海
- ap-guangzhou 广州
- ap-beijing 北京
- ap-hongkong 香港



完整的地区列表请查看 [腾讯云文档](https://cloud.tencent.com/document/api/583/17238)。



### 3、复用 API 网关

如果正式发布 HTTP 函数，每发布一次腾讯云都将自动创建一个标识网关的 serviceId，长期就会出现很多个，为了每次能复用，在第一次发布后，记录下 serviceId 让后面的代码复用，是比较好的习惯（或者提前申请好网关）。

```yaml
service: fc-qinyue-test

provider:
  name: tencent
  runtime: nodejs10
  serviceId: service-xxxxxx # <---- 把 id 填在这里复用
```

**获取 API 网关 id**

方式一，从平台获取。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588752561344-c520ce4d-8dba-4e88-99c6-744e5af73cb9.png#height=577&id=nPqm4&margin=%5Bobject%20Object%5D&name=image.png&originHeight=577&originWidth=1173&originalType=binary&size=72901&status=done&style=none&width=1173" width="1173" />

方式二，在每次发布后获取。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588752629863-178fd9db-7dcb-496e-af05-1fc68abfb30f.png#height=115&id=iBgEU&margin=%5Bobject%20Object%5D&name=image.png&originHeight=115&originWidth=746&originalType=binary&size=39588&status=done&style=none&width=746" width="746" />

### 4、绑定域名

腾讯云发布后会自动给一个网关地址来访问云函数，比如 `http://service-xxxxx-xxxxxxxx.gz.apigw.tencentcs.com:80`，同时针对环境，会自动映射三套环境名，加载 path 上。

- 测试环境 /test
- 预发 /prepub
- 线上 /release

在函数的触发管理和 API 网关处都可以看到这个地址。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588752924557-d0eb153e-f583-49c2-b9a4-55e417867b43.png#height=421&id=cPfTl&margin=%5Bobject%20Object%5D&name=image.png&originHeight=578&originWidth=1025&originalType=binary&size=49631&status=done&style=none&width=746" width="746" />

网关处。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588752972052-c2f7fbc8-0725-49e0-ab73-5dec6a7c0c00.png#height=732&id=Qw18W&margin=%5Bobject%20Object%5D&name=image.png&originHeight=732&originWidth=3010&originalType=binary&size=238685&status=done&style=none&width=3010" width="3010" />

如果我们想移除这个环境，那么就得绑定自定义域名。

在 API 网关的自定义域名处，点“新建”。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588753063041-496d876f-3457-47cb-8156-c9e8364e91db.png#height=338&id=mIiB5&margin=%5Bobject%20Object%5D&name=image.png&originHeight=338&originWidth=1096&originalType=binary&size=26777&status=done&style=none&width=1096" width="1096" />

配置自定义路径映射，比如将 `/` 映射到正式的发布环境，这样在用域名访问的时候，就不会带有环境后缀了。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588753124170-9e6a2b01-dad8-47df-9d81-294d8397137b.png#height=607&id=FAbTy&margin=%5Bobject%20Object%5D&name=image.png&originHeight=607&originWidth=904&originalType=binary&size=49449&status=done&style=none&width=904" width="904" />

### 5、额外计费

使用本地工具时，由于使用了腾讯云提供的 SDK，可能会创建一个 COS Bucket 用于代码包的存储，由于 COS 是付费使用，会产生一定的费用费用。请及时关注自己的 COS 情况避免扣费。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1606803155279-51e71ffa-6e9a-4ab9-812b-19003d45483c.png#height=460&id=DRD5n&margin=%5Bobject%20Object%5D&name=image.png&originHeight=460&originWidth=1196&originalType=binary&size=60856&status=done&style=none&width=1196" width="1196" />

### 6、删除腾讯云网关服务

在试玩一段时间的腾讯云服务之后，由于不是每次复用 API 网关，会导致出现很多非重用的网关示例，如下。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588749300990-34089754-5fe2-4fb9-942a-0f9f0abc6984.png#height=1226&id=Jo9cX&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1226&originWidth=2778&originalType=binary&size=261243&status=done&style=none&width=2778" width="2778" />

这个时候由于网关有绑定的函数，删除按钮是灰色的，我们需要手动将资源一一删除。

先进入一个 API 网关实例。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588749368951-da40aa66-249f-46ac-b208-e7085952c528.png#height=361&id=fA0yx&margin=%5Bobject%20Object%5D&name=image.png&originHeight=942&originWidth=1946&originalType=binary&size=134710&status=done&style=none&width=746" width="746" />

进入管理 API，删除底下的通用 API。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588749549259-fd35cfa1-9e00-42a3-82ff-78f3de23dd85.png#height=930&id=iTseJ&margin=%5Bobject%20Object%5D&name=image.png&originHeight=930&originWidth=2346&originalType=binary&size=122962&status=done&style=none&width=2346" width="2346" />

进入环境管理，将环境下线。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588749641386-77ddf012-2b29-46a5-a8dc-6d416d07518e.png#height=770&id=lAclZ&margin=%5Bobject%20Object%5D&name=image.png&originHeight=770&originWidth=2234&originalType=binary&size=134714&status=done&style=none&width=2234" width="2234" />

再回到最开始的列表，就可以点删除了。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1588749709595-1c47d6e3-08af-42e1-be34-961409f82e1a.png#height=986&id=ZpugG&margin=%5Bobject%20Object%5D&name=image.png&originHeight=986&originWidth=2342&originalType=binary&size=182531&status=done&style=none&width=2342" width="2342" />