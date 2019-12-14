# Midway FaaS 开源文档（汇总版）

<a name="61a3ec66"></a>
# 介绍


<a name="ea0d4c1d"></a>
## Midway FaaS 是什么

Midway FaaS 是 Midway 团队在阿里集团 Serverless 的场景上，基于原有的 IoC 基础和代码风格，提供了整体的工具链支持。

特性：

- 和传统开发一致的装饰器和 IoC 体验
- 一份代码跨多个平台的可移植性能力
- 便捷的 FaaS 中间件能力支持
- 针对 FaaS 场景的极致性能优化

我们提供了

- 标准化 FaaS 开发模型
- 一套框架和一套完整的开发到部署的工具链
- 函数运行时支持
- 多云部署等功能


<a name="c0b8dbff"></a>
## 术语描述


<a name="870a51ba"></a>
### 函数

逻辑意义上的一段代码片段，通过常见的入口文件包裹起来执行。函数是单一链路，并且无状态的，现在很多人认为，Serverless = FaaS + BaaS ，而 FaaS 则是无状态的函数，BaaS 解决带状态的服务。


<a name="e07fc5f5"></a>
### 函数组

多个函数聚合到一起的逻辑分组名，对应原有的应用概念。


<a name="4696724e"></a>
### 触发器

触发器，也叫 Event（事件），Trigger 等，特指触发函数的方式。<br />与传统的开发理念不同，函数不需要自己启动一个服务去监听数据，而是通过绑定一个（或者多个）触发器，数据是通过类似事件触发的机制来调用到函数。

目前云厂商最常见的触发器就是 http 和 timer、云存储等。


<a name="a3fb9f9d"></a>
### 函数运行时

英文叫 Runtime，具体指执行函数的环境，其中包含了 Node.js 和一个对接平台的代码包，该代码包会实现对接平台的各种接口，处理异常，转发日志等能力。


<a name="0b42283d"></a>
### 发布平台

函数最后承载的平台，现在主要指阿里云 FC 与腾讯云 SCF 两大平台，未来会支持亚马逊 AWS 等更多平台。


<a name="f81e935c"></a>
## 使用 TypeScript

Typescript 和 Javascript 既相似又有着许多不同，以往的 Node.js 应用和模块大多都是 Javascript 写的。

而 Midway 在阿里沉淀多年，在多人协作和开发的过程中我们发现，Typescript 的接口定义和类型系统，使得应用编码出错的概率大大降低。

在全新的体系中，我们 **推荐使用 Typescript 语法来编码**。

推荐教程：

- [Typescript 入门教程 ](https://ts.xcatliu.com/)
- [Typescript Handbook ](https://zhongsp.gitbooks.io/typescript-handbook/)

<a name="article-title"></a>
# 快速入门
本文将带你一步步的开发出一个完整的 Midway FaaS 应用。

<a name="LDaAA"></a>
## 环境准备

- 操作系统：支持 macOS，Linux，Windows
- 运行环境：建议选择 [LTS 版本](http://nodejs.org/)，最低要求 8.x。

在安装完成 Node 后，继续安装我们开发所需要用到的框架 Serverless。

> 国内用户建议使用 `cnpm` 加速npm
> `npm install -g cnpm --registry=https://registry.npm.taobao.org`


```bash
$ npm install -g serverless
```

<a name="NhgiP"></a>
## 快速初始化
我们基于 Serverless 框架，提供了开箱即用的 examples：

```bash
$ serverless install --url https://github.com/midwayjs/midway-faas-examples/tree/master/demo-faas
```

完成后进入项目安装依赖：

```bash
$ cd demo-faas
$ npm i
```

<a name="AprEU"></a>
## 目录结构
初始化完成后，目录结构如下所示：

```
.
├── README.md
├── package.json
├── serverless.yml
├── src
│   └── index.ts
├── test
│   └── index.test.ts
└── tsconfig.json
```

具体目录解释如下：

- `serverless.yml` 函数配置文件，具体参考：[Serverless.yml](#serverlessyml)
- `src/**` 函数运行时代码
- `test/**` 函数单元测试相关代码，具体参考：[单元测试](#单元测试-1)
- `README.md` 项目说明文档
- `package.json` 项目依赖配置文件
- `tsconfig.json` TypeScript 配置文件，具体参考：[tsconfig.json](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)

<a name="Clky1"></a>
## 依赖注入
IoC([Inversion of control](https://en.wikipedia.org/wiki/Inversion_of_control)) 指控制反转，属于现代软件开发中一个非常重要的概念。而 Midway 框架中使用了非常多的依赖注入的特性，通过装饰器的轻量特性，让依赖注入变的优雅，从而让开发过程变的便捷有趣。

若之前对依赖注入没有了解，推荐先阅读我们的[依赖注入手册](https://midwayjs.org/injection/guide.html)。

<a name="NokdV"></a>
## 编写代码
在了解上述基础知识后，你就可以开始尝试在本地编写代码。<br />例如尝试修改 `src/index.ts` 中 `handler` 的返回值，新增一个 `date` 的字段：

```typescript
// src/index.ts

import { FaaSContext, func, inject, provide } from '@midwayjs/faas';

@provide()
@func('index.handler')
export class HelloService {
  async handler(event) {
    return {
    	message: 'Hello World',
      date: new Date()
    }
  }
}
```

<a name="pBFLu"></a>
## 本地调用
我们提供的便捷的 cli 命令来实现本地调用，只需要在项目根目录下运行如下命令，即可调用编写的 index 函数：

```bash
$ serverless invoke --function index
```

调用演示如下：

![render1576235391983.gif](https://intranetproxy.alipay.com/skylark/lark/0/2019/gif/49582/1576235466021-82b96e97-417a-4ac7-9572-5f35c3e53f14.gif#align=left&display=inline&height=860&name=render1576235391983.gif&originHeight=860&originWidth=1454&size=892849&status=done&style=none&width=1454)

<a name="rXHCg"></a>
## 单元测试
单元测试非常重要，我们也提供了 [@midway/invoke](#) 这样非常便利的工具，供大家书写单元测试。

在项目目录下，只需输入如下命令即可运行单测：

```bash
$ serverless test
```

单测流程演示如下：

![render1576235168788.gif](https://intranetproxy.alipay.com/skylark/lark/0/2019/gif/49582/1576235262547-af124e43-cfae-44c0-a0dc-ea0c1a05e63e.gif#align=left&display=inline&height=860&name=render1576235168788.gif&originHeight=860&originWidth=1454&size=1074880&status=done&style=none&width=1454)

<a name="quokQ"></a>
## 部署
Midway FaaS 应用的部署也非常简单，只需要在项目根目录下运行如下命令，即可开始部署流程。

```bash
$ serverless deploy
```

同时，我们也提供了多云平台部署与高密度部署等选项，具体可以参考部署章节的内容。

<a name="J5uLq"></a>
# 函数开发
本部分将介绍如何开发一个函数。而在开发函数前，我们需要先对一个函数的构成有所了解。

<a name="hoCCM"></a>
## 新增一个函数
在 Midway FaaS 应用中，函数是基于 Class 实现的。<br />首先我们先看示例代码：

```typescript
import { FaaSContext, func, inject, provide, FunctionHandler } from '@midwayjs/faas';

@provide()
@func('index.handler')
export class HelloService implements FunctionHandler {
  @inject()
  ctx: FaaSContext;

  async handler(event) {
    return {
      message: "Hello World"
    };
  }
}

```

接下来我们将一步一步的描述如何实现该函数。

<a name="UCz5i"></a>
### 定义函数
FaaS 函数是基于类实现的，因此第一步我们只需要定义一个类即可：

```typescript
export class HelloService {}
```

<a name="SKj7M"></a>
### 实现接口
FaaS 函数遵循一定的开发规范，而我们也在 `@midwayjs/faas` 提供了对应的接口，在开发函数时实现该接口。<br />函数中提供的 handler 方法则是被调用的入口，该函数支持 `Async/Await` 调用。
```typescript
export class HelloService implements FunctionHandler {
  async handler(event) {
    return {
      message: "Hello World"
    };
  }
}

```

函数中的 event 参数则是调用时的平台传入的参数。

<a name="tjH9G"></a>
### 依赖注入
此时虽然我们已经实现了一个函数，但是还不能被调用，我们需要借助依赖注入的功能使得该函数在运行时可以被发现。因此 Midway FaaS 中提供了 [@provide](#) 和 [@function](#) 两个装饰器。

具体解释如下：

- [@provide](#) 声明这是一个可使用依赖注入的类。具体文档参考：[URL](https://midwayjs.org/injection/guide.html#provide)
- [@function](#) 声明这是一个 FaaS 函数，其中传入的 id 则是在 `serverless.yml` 中声明的 id

```typescript
@provide()
@func('index.handler')
export class HelloService implements FunctionHandler { 
  async handler(event) {
    return {
      message: "Hello World"
    };
  }
}
```

<a name="MPuJu"></a>
### 注入 FaaSContext
针对多平台参数不一致的情况，我们提供了统一的 `FaaSContext` 供大家使用。<br />而借助依赖注入的能力，实际使用起来也非常简单，如下所示：

```typescript
@provide()
@func('hello.handler')
export class HelloService implements FunctionHandler {
  
 @inject()
 ctx: FaaSContext;
  
 async handler(event) {
   return {
     message: "Hello World"
   };
 }
}
```

关于 `FaaSContext` 的具体定义见：[FaaSContext](https://github.com/midwayjs/midway-faas/blob/development/packages/faas/src/interface.ts#L64)

<a name="eec6E"></a>
## 添加至 serverless.yml
`serverless.yml` 是我们用来声明所需部署函数服务的文件，新增函数只需要在 serverless.yml 中填入相关信息即可。

如我们这次添加的 hello 函数，则直接新增该函数即可。

```yaml
functions:
  index:
    handler: index.handler
    events:
      - http:
          method: get
   hello:
    handler: hello.handler
    events:
      - http:
          method: get
```

关于 `serverless.yml` 的规范，可参考：[Serverless.yml](#serverlessyml)

<a name="SZJlw"></a>
# 核心功能
<a name="cc2aH"></a>
## 多函数开发
midway-faas 支持在同一个仓库中进行多个函数开发，在 `serverless.yml` 文件中的 `functions` 字段中可以指定多个方法：
```javascript
service: faas-test

provider:
  name: aliyun

functions:
  index:                    # 函数 index
    handler: index.handler  # 函数入口
    events:
      - http:
          path: /index
          method: get
  hello:                    # 函数 hello
    handler: hello.handler  # 函数入口
```

由于midway-faas基于IoC注入并提供装饰器能力，因此函数的代码文件可以随意放在任意位置，只需要通过装饰器标明handler即可，在代码运行时会进行依赖扫描注入。
<a name="Ft9JK"></a>
## 单元测试
midway-faas 提供了 `serverless test` 命令，可以用来执行代码test目录中的 `*.test.ts` 测试用例。<br />如果要测试整个函数的调用结果，可以使用 `@midwayjs/invoke` 工具包进行本地调用：

```javascript
// index.test.ts
import { invoke } from '@midwayjs/invoke';
import * as assert from 'assert';

describe('/test/localInvoke', () => {
  it('invoke index', async () => {
    const result = await invoke({
      functionName: func,
      debug: this.options.debug,
      data: this.options.data,
      trigger: this.options.trigger
    });
    assert(/hello/.test(result);
  });
});
```

<a name="wXS56"></a>
## 高密度部署
midway-faas 创新性的提供了高密度部署的能力，可以将多个函数自由的组合部署到同一个函数容器内，使得低流量函数可以聚合流量来减少冷启动消耗；同时如果一个高密度部署几个函数中的某一个变为热点，也可以无需修改任何代码就能迅速拆分部署。

建议使用高密度部署时同时配置函数的域名，这样构建时就能自动分析函数路径，实现聚合、拆分后函数请求路径无任何变化。

若要使用高密度部署，需要在 `serverless.yml` 文件中配置 `aggregation` 字段：

```yaml
functions:
  index:									# 函数名
    handler: index.handler
    events:
      - http:
          path: /api/index	# 函数请求路径
          method: get
  hello:
    handler: hello.handler
    events:
      - http:
          path: /api/hello
          method: get
          
aggregation:
  common:									# 高密度部署分组名，会自动拼接aggregation发布为一个单独的函数
    deployOrigin: false   # 如果为true，则聚合的index和hello函数也会进行单独部署
    functions:						# 要聚合的 函数名 列表
      - index
      - hello
      
custom:
  customDomain:
    domainName: domain.example.com

```

如上面的示例，原本的两个函数单独部署时请求路径为：<br />index: `domain.example.com/api/index`<br />hello: `domain.example.com/api/hello`<br />在进行高密度部署之后，回创建一个 `domain.example.com/api/*` 路径，来统一承接 `/index`  与 `/hello`  路径的流量，然后再跟进每个的子路径进行分发，因此函数的请求路径不会产生变化。

<a name="EXNvD"></a>
# 部署
midway-faas 提供了一键部署到云平台功能，只需要执行 `serverless deploy` 命令即可。
<a name="OljHI"></a>
## 多云部署
在执行 `serverless deploy` 时，如果在 `serverless.yml` 文件中未指定 `provider.name` ，则会提示选择要部署到 阿里云 还是 腾讯云 等云平台。<br />另外也可以通过如下命令来强制性指定要部署到的目标平台：
```shell
serverless deploy -playform=<aliyun|tencent>
```

<a name="m26bz"></a>
### 阿里云
阿里云首次部署需要配置 `accountId` 、 `accessKey` 与 `accessSecret`<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2019/png/12726/1576236625847-6ddd3c41-7ab0-4e94-bd7e-aea3394696f4.png#align=left&display=inline&height=257&name=image.png&originHeight=514&originWidth=1152&size=96360&status=done&style=none&width=576)

相关配置可以参考下列图示进行获取：<br />![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2019/png/12726/1576236656586-a60d3c4a-be61-4a99-990a-bbc4b0e7232b.png#align=left&display=inline&height=219&name=image.png&originHeight=696&originWidth=1832&size=177573&status=done&style=none&width=577)[https://account.console.aliyun.com/#/secure](https://account.console.aliyun.com/#/secure)

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2019/png/12726/1576236673971-10c9d827-3324-4f1a-a3ad-4b133bc007ff.png#align=left&display=inline&height=296&name=image.png&originHeight=592&originWidth=2406&size=175954&status=done&style=none&width=1203)<br />[https://usercenter.console.aliyun.com/#/manage/ak](https://usercenter.console.aliyun.com/#/manage/ak)
<a name="t7SG9"></a>
### 腾讯云
<a name="Odt74"></a>
#### 用户信息认证
腾讯云在部署时，如果是首次部署，则控制台会展示相应二维码，扫码即可完成认证，后续会默认复用该配置<br />后续如想修改部署时的使用的用户，可手动在 serverless.yml 中设置当前用户的认证信息，教程：[https://cloud.tencent.com/document/product/1154/38811](https://cloud.tencent.com/document/product/1154/38811)
<a name="iaSjT"></a>
#### 部署网关设置
腾讯云在部署时，会为函数默认创建网关触发器<br />如果想避免重复创建，可按下列教程操作：<br />发布完成后，控制台会默认显示腾讯云此次创建的网关 serviceId（如下图所示）<br />此时需要修改 serverless.yml 的配置文件，serviceId 可以配在以下两处：

1. provider

此处配置则对所有函数生效，所有函数共享一个网关 serviceId
```yaml
provider:
  name: tencent
  runtime: Nodejs8.9
  serviceId: <控制台返回的 ServiceId>

```

2. events/http

此处配置则对指定函数生效

```yaml
functions:
  index:
    initializer: index.initializer
    handler: index.handler
    events:
    - http:
				method: get
				serviceId: <控制台返回的 ServiceId>
```

<a name="62rOH"></a>
# 参考
<a name="EexI4"></a>
## serverless.yml

```yaml
service: 											# 【必要】应用服务配置
  name: demo-aggregation			# 【必要】应用服务名称
  description: midway-faas		# 描述信息
  
provider:											# 【必要】目标运行时环境
  name: aliyun						    # 【必要】目标云平台，可通过 --platform 指定
  runtime: nodejs8						# 运行时环境，默认aliyun为nodejs8，腾讯云为Nodejs8.9
  timeout: 30									# 超时时长，默认为 30
  memorySize: 512							# 内存占用，默认为 512
  role: role									# 用户角色
  
functions:										# 【必要】函数列表
  index:											# 【必要】函数名
    handler: index.handler		# 函数入口方法，默认为 函数名.handler
    initializer: index.init   # 仅aliyun可用，函数的初始化方法，默认为 函数名.initializer
    events:										# 触发器
      - http:									# 触发器类型，触发器详细内容请查看下文的触发器部分
          path: /index/				
          method: get

plugins:											# 【必要】插件
  - serverless-midway-plugin  # 【必要】midway-faas的插件，如果没有则无法使用各项能力
	
custom:												# 用户请求配置
  customDomain:								# domain配置
    domainName: example.com		# domain配置

aggregation:									# 高密度部署，详细内容请查看 高密度部署部分
  index:											# 高密度部署聚合名称
    deployOrigin: false				# 是否部署原始方法
    functions:								# 高密度部署方法列表
      - index									# 高密度部署方法名
      - hello

package:											# 打包配置
	include:										# 打包包含文件列表，默认为 package.json、构建后的代码和依赖
  	- package.json
  exclude:										# 打包剔除文件列表
  	- test/*
  artifact: midwayFaas.zip		# 打包后的压缩包文件名

```

<a name="8REzY"></a>
### http 触发器
```typescript
export type HTTPEventType = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';

export interface http {									# http触发器结构
	path: string;
  method: HTTPEventType;
  serviceId?: string;										# only for tencent
}

// 与aliyun fc http 触发器的转换关系
export interface FCHTTPEvent {
  Type: 'HTTP';
  Properties: {
    AuthType?: 'ANONYMOUS' | 'FUNCTION';
    Methods?: HTTPEventType[];						# http.method
  };
}

// 与tencent scf apigw 触发器的转换关系
export interface ApiGateway {
  name: string;														# ${funName}_${provider.stage}_apigw
  parameters: ApiGatewayParameters;	    
}

export interface ApiGatewayParameters {
  stageName: string;     									# ${provider.stage}
  serviceId: null;												# ${provider.stage}
  httpMethod: SCFHTTPMethod;   						# http.method
  integratedResponse: boolean;						# ${fun.timeout}
  path: string;														# http.path
  enableCORS?: boolean;
  serviceTimeout: number;
}

```

<a name="bBA9l"></a>
### timer 触发器

```typescript
export interface timer {
  value: string;												# 值
  type: 'cron' | 'every' | 'interval'		# 类型 for aliyun
  payload?: string;											# payload for aliyun
}
  
// 与 aliyun fc Timer 触发器转换关系
export interface FCTimerEvent {
  Type: 'Timer';
  Properties: {
    CronExpression: string;						# timer.type === 'every' ? `@every ${timer.value}` : timer.value,
    Enable?: boolean;
    Payload?: string;									# timer.payload
  };
}
 
// 与 tencent scf Timer 触发器转换关系
export interface Timer {
  name: string;
  parameters: {
    cronExpression: string;							# timer.value
    enable: boolean;										# true
  }
}
```

