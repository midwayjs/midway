import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 部署到阿里云函数计算

阿里云 Serverless 是国内最早提供 Serverless 计算服务的团队之一, 依托于阿里云强大的云基础设施服务能力，不断实现技术突破。目前，淘宝、支付宝、钉钉、高德等已经将 Serverless 应用于生产业务，云上的 Serverless 产品在南瓜电影、网易云音乐、爱奇艺体育、莉莉丝等数万家企业成功落地。

阿里云 Serverless 包含许多产品，如函数计算 FC，轻量应用引擎 SAE 等，本文主要使用了其 **函数计算** 部分。

下面是常见的函数触发器的使用、测试和部署方法。



## 部署类型

阿里云的函数计算部署类型比较多，根据运行的不同容器有以下几种。

| 名称                           | 能力限制                                         | 描述                                                         | 部署媒介        |
| ------------------------------ | ------------------------------------------------ | ------------------------------------------------------------ | --------------- |
| 内置运行时                     | 不支持流式请求和响应；不支持太大的请求和响应入参 | 只能部署函数接口，不需要自定义端口，构建出 zip 包给平台部署  | zip 包部署      |
| 自定义运行时（Custom Runtime） |                                                  | 可以部署标准应用，启动 9000 端口，使用平台提供的系统镜像，构建出 zip 包给平台部署 | zip 包部署      |
| 自定义容器（Custom Container） |                                                  | 可以部署标准应用，启动 9000 端口，自己控制所有环境依赖，构建出 Dockerfile 提供给平台部署 | Dockerfile 部署 |

在平台上分别对应创建函数时的三种方式。

![](https://img.alicdn.com/imgextra/i1/O1CN01JrlhOw1EJBZmHklbq_!!6000000000330-2-tps-1207-585.png)



## 纯函数开发（内置运行时）

下面我们将以使用 **"内置运行时部署"** 纯函数作为示例。



### 触发器代码

<Tabs groupId="triggers">
<TabItem value="event" label="Event">

发布不包含触发器的函数，这是最简单的类型，可以直接通过 event 手动触发参数，也可以在平台绑定其他触发器。

通过直接在代码中的 `@ServerlessTrigger` 装饰器绑定事件触发器。

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/core';
import { Context } from '@midwayjs/faas';

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
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/core';
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
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/core';
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

</TabItem>

<TabItem value="timer" label="Timer">

定时任务触发器用于定时执行一个函数。

:::info
温馨提醒，测试函数后请及时关闭触发器自动执行，避免超额扣费。
:::

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/core';
import { Context } from '@midwayjs/faas';
import type { TimerEvent } from '@midwayjs/fc-starter';

@Provide()
export class HelloAliyunService {
  @Inject()
  ctx: Context;

  @ServerlessTrigger(ServerlessTriggerType.TIMER)
  async handleTimerEvent(event: TimerEvent) {
    this.ctx.logger.info(event);
    return 'hello world';
  }
}
```

**事件结构**

Timer 消息返回的结构如下，在 `TimerEvent` 类型中有描述。

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
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/core';
import { Context } from '@midwayjs/faas';
import type { OSSEvent } from '@midwayjs/fc-starter';

@Provide()
export class HelloAliyunService {
  @Inject()
  ctx: Context;

  @ServerlessTrigger(ServerlessTriggerType.OS)
  async handleOSSEvent(event: OSSEvent) {
    // xxx
  }
}
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

* 1、阿里云消息队列会对 Topic 和 Queue 产生一定的费用。
* 2、提供的默认消息队列格式为 JSON

:::

```typescript
import { Provide, Inject, ServerlessTrigger, ServerlessTriggerType } from '@midwayjs/core';
import { Context } from '@midwayjs/faas';
import type { MNSEvent } from '@midwayjs/fc-starter';

@Provide()
export class HelloAliyunService {
  @Inject()
  ctx: Context;

  @ServerlessTrigger(ServerlessTriggerType.MQ)
  async handleMNSEvent(event: MNSEvent) {
    // ...
  }
}
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

:::info

触发器的更多配置由于和平台相关，将写在 `s.yaml` 中，如定时任务的时间间隔等，更多细节请查看下面的部署段落。

:::



### 类型定义

FC 的定义将由适配器导出，为了让 `ctx.originContext` 的定义保持正确，需要将其添加到 `src/interface.ts` 中。

```typescript
// src/interface.ts
import type {} from '@midwayjs/fc-starter';
```

此外，还提供了各种 Event 类型的定义。

```typescript
// Event 类型
import type { 
  OSSEvent,
  MNSEvent,
  SLSEvent,
  CDNEvent,
  TimerEvent,
  APIGatewayEvent,
  TableStoreEvent,
} from '@midwayjs/fc-starter';
// InitializeContext 类型
import type { InitializeContext } from '@midwayjs/fc-starter';
```



### 本地开发

HTTP 触发器和 API Gateway 类型可以通过本地 `npm run dev` 和传统应用类似的开发方式进行本地开发，其他类型的触发器本地无法使用 dev 开发，只能通过运行 `npm run test` 进行测试执行。



### 本地测试

和传统应用测试类似，使用 `createFunctionApp` 方法创建函数 app， 使用 `close` 方法关闭。

```typescript
import { Application, Context, Framework } from '@midwayjs/faas';
import { mockContext } from '@midwayjs/fc-starter';
import { createFunctionApp } from '@midwayjs/mock';

describe('test/hello_aliyun.test.ts', () => {

  it('should get result from event trigger', async () => {
    
    // create app
    const app: Application = await createFunctionApp<Framework>(join(__dirname, '../'), {
      initContext: mockContext(),
    });
    
    // ...
    
    await close(app);
  });
});
```

`mockContext` 方法用来模拟一个 FC Context 数据结构，可以自定传递一个类似的结构或者修改部分数据。

```typescript
import { Application, Context, Framework } from '@midwayjs/faas';
import { mockContext } from '@midwayjs/fc-starter';
import { createFunctionApp } from '@midwayjs/mock';

describe('test/hello_aliyun.test.ts', () => {

  it('should get result from event trigger', async () => {
    
    // create app
    const app: Application = await createFunctionApp<Framework>(join(__dirname, '../'), {
      initContext: Object.assign(mockContext(), {
        function: {
          name: '***',
          handler: '***'
        }
      }),
    });
    
    // ...
    
    await close(app);
  });
});
```

不同的触发器有着不同的测试方法，下面列出了一些常见的触发器。

<Tabs groupId="triggers">
<TabItem value="event" label="Event">

通过 `getServerlessInstance` 获取类实例，直接调用实例方法，传入参数进行测试。

```typescript
import { HelloAliyunService } from '../src/function/hello_aliyun';

describe('test/hello_aliyun.test.ts', () => {

  it('should get result from event trigger', async () => {
    // ...
    const instance = await app.getServerlessInstance<HelloAliyunService>(HelloAliyunService);
    expect(await instance.handleEvent('hello world')).toEqual('hello world');
    // ...
  });
});
```

</TabItem>

<TabItem value="http" label="HTTP">

和应用类似相同，通过 `createFunctionApp` 创建函数 app，通过 `createHttpRequest` 方式进行测试。

```typescript
import { HelloAliyunService } from '../src/function/hello_aliyun';

describe('test/hello_aliyun.test.ts', () => {

  it('should get result from http trigger', async () => {
    // ...
    const result = await createHttpRequest(app).get('/').query({
      name: 'zhangting',
    });
    expect(result.text).toEqual('hello zhangting');
    // ...
  });
});
```

</TabItem>

<TabItem value="apigw" label="API 网关">

和 HTTP 测试相同，通过 `createFunctionApp` 创建函数 app，通过 `createHttpRequest` 方式进行测试。

```typescript
import { createHttpRequest } from '@midwayjs/mock';

describe('test/hello_aliyun.test.ts', () => {

  it('should get result from http trigger', async () => {
    // ...
    const result = await createHttpRequest(app).post('api_gateway_aliyun').send({
      name: 'zhangting',
    });

    expect(result.text).toEqual('hello zhangting');
    // ...
  });
});
```

</TabItem>

<TabItem value="timer" label="Timer">

和 HTTP 测试不同，通过 `createFunctionApp` 创建函数 app，通过 `getServerlessInstance` 获取整个类的实例，从而调用到特定方法来测试。

可以通过 `mockTimerEvent` 方法快速创建平台传入的结构。

```typescript
import { HelloAliyunService } from '../src/function/hello_aliyun';
import { mockTimerEvent } from '@midwayjs/fc-starter';

describe('test/hello_aliyun.test.ts', () => {

  it('should get result from timer trigger', async () => {
    // ...
    const instance = await app.getServerlessInstance<HelloAliyunService>(HelloAliyunService);
    expect(await instance.handleTimerEvent(mockTimerEvent())).toEqual('hello world');
    // ...
  });
});
```

</TabItem>

<TabItem value="oss" label="OSS">

和 HTTP 测试不同，通过 `createFunctionApp` 创建函数 app，通过 `getServerlessInstance` 获取整个类的实例，从而调用到特定方法来测试。

可以通过 `createOSSEvent` 方法快速创建平台传入的结构。

```typescript
import { HelloAliyunService } from '../src/function/hello_aliyun';
import { mockOSSEvent } from '@midwayjs/fc-starter';

describe('test/hello_aliyun.test.ts', () => {
  it('should get result from oss trigger', async () => {
    // ...
    const instance = await app.getServerlessInstance<HelloAliyunService>(HelloAliyunService);
    expect(await instance.handleOSSEvent(mockOSSEvent())).toEqual('hello world');
    // ...
  });
});
```

</TabItem>

<TabItem value="mns" label="MNS">

和 HTTP 测试不同，通过 `createFunctionApp` 创建函数 app，通过 `getServerlessInstance` 获取整个类的实例，从而调用到特定方法来测试。

可以通过 `createMNSEvent` 方法快速创建平台传入的结构。

```typescript
import { HelloAliyunService } from '../src/function/hello_aliyun';
import { mockMNSEvent } from '@midwayjs/fc-starter';

describe('test/hello_aliyun.test.ts', () => {

  it('should get result from oss trigger', async () => {
    // ...
    const instance = await app.getServerlessInstance<HelloAliyunService>(HelloAliyunService);
    expect(await instance.handleMNSEvent(mockMNSEvent())).toEqual('hello world');
    // ...
  });
});
```

</TabItem>

</Tabs>

## 纯函数部署（内置运行时）

以下将简述如何使用 Serverless Devs 部署到阿里云函数。

### 1、确认启动器

在项目根目录的 `f.yml` 的 `provider` 段落处确保 starter 为 `@midwayjs/fc-starter`。

```yaml
provider:
  name: aliyun
  starter: '@midwayjs/fc-starter'
```



### 2、安装 Serverless Devs 工具

aliyun 使用 [Serverless Devs 工具](https://www.serverless-devs.com/) 进行函数部署。

你可以将其安装到全局。

```bash
$ npm install @serverless-devs/s -g
```

参考 [密钥配置](https://docs.serverless-devs.com/serverless-devs/quick_start) 文档进行配置。



### 3、编写一个  Serverless Devs 描述文件

在根目录创建一个 `s.yaml` ，添加以下内容。

```yaml
edition: 1.0.0
name: "midwayApp" #  项目名称
access: "default" #  秘钥别名

vars:
  service:
    name: fc-build-demo
    description: 'demo for fc-deploy component'
services:
  project-0981cd9b07:
    component: devsapp/fc
    props:
      region: cn-hangzhou
      service: ${vars.service}
      function:
        name: hello	# 函数名
        handler: helloHttpService.handleHTTPEvent
        codeUri: '.'
        initializer: helloHttpService.initializer
      customDomains:
        - domainName: auto
          protocol: HTTP
          routeConfigs:
            - path: /*
              serviceName: ${vars.service.name}
              functionName: helloHttpService-handleHTTPEvent
      triggers:
        - name: http
          type: http
          config:
            methods:
              - GET
            authType: anonymous

```

每加一个函数都需要调整 `s.yaml` 文件，为此Midway 提供了一个 `@midwayjs/serverless-yaml-generator` 工具用来将装饰器函数信息写入 `s.yaml`。

```diff
{
	"scripts": {
+    "generate": "serverless-yaml-generator",
  },
  "devDependencies": {
+    "@midwayjs/serverless-yaml-generator": "^1.0.0",
  },
}
```

通过执行下面的命令，可以将现有函数信息填充到 `s.yaml` 中，并生成入口文件，方便排查问题。

```bash
$ npm run generate
```

工具将以函数名作为 key 在 `s.yaml` 中查找配置。

* 1、如果存在函数，则会覆盖特定字段，比如 handler，http 触发器的 methods
* 2、如果不存在函数，则会添加一个新函数
* 3、工具不会写入 http 的路由方法，为了简化后续更新，可以提供一个 `/*` 路由（如示例）

我们推荐用户只在装饰器定义基础函数名，函数 handler，以及基础触发器信息（比如 http 触发器的 path 和 method），其余都写在 `yaml` 中。

`s.yaml` 的完整配置较为复杂，具体请参考 [描述文件规范](https://docs.serverless-devs.com/serverless-devs/yaml)。



### 4、编写一个部署脚本

由于部署有构建，拷贝等多个步骤，我们可以编写部署脚本统一这个过程。

比如在项目根目录新建一个 `deploy.sh` 文件，内容如下。

```bash
#!/bin/bash

set -e

# 构建产物目录
export BUILD_DIST=$PWD/.serverless
# 构建开始时间，单位毫秒
export BUILD_START_TIME=$(date +%s%3N)

echo "Building Midway Serverless Application"

# 打印当前目录 cwd
echo "Current Working Directory: $PWD"
# 打印结果目录 BUILD_DIST
echo "Build Directory: $BUILD_DIST"

# 安装当前项目依赖
npm i

# 执行构建
./node_modules/.bin/tsc || return 1
# 生成入口文件
./node_modules/.bin/serverless-yaml-generator || return 1

# 如果 .serverless 文件夹存在，则删除后重新创建
if [ -d "$BUILD_DIST" ]; then
  rm -rf $BUILD_DIST
fi

mkdir $BUILD_DIST

# 拷贝 dist、 *.json、*.yml 到 .serverless 目录
cp -r dist $BUILD_DIST
cp *.yaml $BUILD_DIST 2>/dev/null || :
cp *.json $BUILD_DIST 2>/dev/null || :
# 移动入口文件到 .serverless 目录
mv *.js $BUILD_DIST 2>/dev/null || :

# 进入 .serverless 目录
cd $BUILD_DIST
# 安装线上依赖
npm install --production

echo "Build success"

# 在 .serverless 目录进行部署
s deploy

```

可以将这个 `deploy.sh` 文件放到 `package.json` 的 `deploy` 指令中，后续部署执行 `npm run deploy` 即可。

```json
{
  "scripts": {
    "deploy": "sh deploy.sh"
  }
}
```

:::tip

* 1、 `deploy.sh` 只测试了 mac，其余平台可以自行调整
* 2、脚本内容可以根据业务逻辑自行调整，比如拷贝的文件等

:::



## 自定义运行时部署

### 1、创建项目

自定义运行时可以使用标准项目来部署，由于需要提供 9000 端口，需要创建 Midway koa/express/express 项目。

初始化项目请参考 [创建第一个应用](/docs/quickstart)。

### 2、调整端口

为了避免影响本地开发，我们仅在入口 `bootstrap.js` 处增加端口。

```typescript
const { Bootstrap } = require('@midwayjs/bootstrap');

// 显式以组件方式引入用户代码
Bootstrap.configure({
  globalConfig: {
    koa: {
      port: 9000,
    }
  }
}).run()
```

不同的框架修改端口请参考：

* [koa 修改端口](/docs/extensions/koa)
* [Egg 修改端口](/docs/extensions/egg)
* [Express 修改端口](/docs/extensions/express)



### 3、平台部署配置

* 1、选择运行环境，比如 `Node.js 18`
* 2、选择代码上传方式，比如可以本地打 zip 包上传
* 3、启动命令指定 node bootstrap.js
* 4、监听端口 9000

![](https://img.alicdn.com/imgextra/i3/O1CN010JA2GU1lxNeqm81AR_!!6000000004885-2-tps-790-549.png)

配置完成之后，上传压缩包即可部署完成。
