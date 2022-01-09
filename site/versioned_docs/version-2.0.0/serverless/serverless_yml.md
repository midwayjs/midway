---
title: f.yml 定义
---

## 概述

经过阿里集团标准化小组的讨论，结合社区 `serverless.yml` 的已有设计，通过一个描述文件 (**f.yml**) 来描述整个仓库中的函数信息，现有的发布构建工具，运行时都会基于此文件进行各种处理。

描述文件结构基于 [serverless.yml](https://serverless.com/framework/docs/providers/aws/guide/serverless.yml/)，目标是在现有社区化复用能力之上，希望各个平台的代码能尽可能统一，一套代码可以多处部署，并向上扩展。

在 midway serverless v2 之后， `functions` 段落逐步被装饰器所替代，但是 yml 中的内容依旧保留，作为底层能力。

装饰器将最终生成为下面的 yml 结构，可以对照排错。

## 大体结构

由于不同平台的触发器不同，配置信息也不同，配置略微有些差别，但是整体基本一致。

目前第一层字段包括：

- **service**   当前的服务（函数分组），对标应用
- **provider** 当前的服务提供商，比如 aliyun，tencent 等。
- **functions** 函数的具体信息
- **layers** 具体的 layer 层配置
- **resources**   引用的资源
- **plugins**   引用的插件，serverless 预留
- **aggregation** 聚合部署字段
- **package**   构建的配置信息

大体如下：

```yaml
service: serverless-hello-world

provider:
  name: aliyun
  runtime: nodejs10
  role: acs:ram::1647796581073291:role/aoneserverlesstestrole

functions:
  hello1:
    handler: entry.handler
    events:
      - http:
          path: /foo
          method:
            - GET
            - POST
  hello2:
    handler: entry.handler2
    events:
      - http:
          path: /foo
          method:
            - GET
            - POST
  hello3:
    handler: test.handler2
    events:
      - http:
          path: /foo
          method:
            - GET
            - POST

layers:
  test:
    path: npm:@midwayjs/egg-layer@latest

custom:
  customDomain:
    domainName: midway-fc.xxxx.com
```

## 平台字段支持

由于字段非常多，下面的表格统计了所有当前支持的字段，具体的字段描述可以在下面更详细的表格中查找。

√ 代表工具链已经支持，○ 代表部分支持平台支持，但是工具链尚未支持。

| **字段**                                             | **aliyun** | **tencent** | **aws** |     |
| ---------------------------------------------------- | ---------- | ----------- | ------- | --- |
| service.name                                         | √          | √           |         |     |
| service.description                                  | √          | √           |         |     |
|                                                      |            |             |         |     |
| provider.name                                        | √          | √           |         |     |
| provider.runtime                                     | √          | √           |         |     |
| provider.stage                                       |            | √           |         |     |
| provider.region                                      |            | √           |         |     |
| provider.credentials                                 |            | √           |         |     |
| provider.timeout                                     | √          | √           |         |     |
| provider.initTimeout                                 | √          |             |         |     |
| provider.memorySize                                  | √          | √           |         |     |
| provider.description                                 | √          |             |         |     |
| provider.role                                        | √          | √           |         |     |
| provider.environment                                 | √          | √           |         |     |
| provider.serviceId                                   |            | √           |         |     |
| provider.vpcConfig                                   | √          |             |         |     |
| provider.vpcConfig.vpcId                             | √          |             |         |     |
| provider.vpcConfig.vSwitchIds                        | √          |             |         |     |
| provider.vpcConfig.securityGroupId                   | √          |             |         |     |
| provider.internetAccess                              | √          |             |         |     |
| provider.policies                                    | √          |             |         |     |
| provider.logConfig.project                           | √          |             |         |     |
| provider.logConfig.logstore                          | √          |             |         |     |
| provider.nasConfig                                   | √          |             |         |     |
| provider.nasConfig.userId                            | √          |             |         |     |
| provider.nasConfig.groupId                           | √          |             |         |     |
| provider.nasConfig.mountPoints                       | √          |             |         |     |
|                                                      |            |             |         |     |
| functions.[fnName]                                   | √          | √           |         |     |
| functions.[fnName].handler                           | √          | √           |         |     |
| functions.[fnName].stage                             |            | √           |         |     |
| functions.[fnName].name                              |            |             |         |     |
| functions.[fnName].description                       | √          | √           |         |     |
| functions.[fnName].memorySize                        | √          | √           |         |     |
| functions.[fnName].timeout                           | √          |             |         |     |
| functions.[fnName].runtime                           | √          |             |         |     |
| functions.[fnName].initTimeout                       | √          |             |         |     |
| functions.[fnName].environment                       | √          | √           |         |     |
| functions.[fnName].concurrency                       | √          |             |         |     |
| functions.[fnName].events                            | √          | √           |         |     |
|                                                      |            |             |         |     |
| functions.[fnName].events.[http]                     | √          | √           |         |     |
| functions.[fnName].events.[http].name                | √          |             |         |     |
| functions.[fnName].events.[http].method              | √          | √           |         |     |
| functions.[fnName].events.[http].path                | √          | √           |         |     |
| functions.[fnName].events.[http].serviceId           |            | √           |         |     |
| functions.[fnName].events.[http].timeout             |            | √           |         |     |
| functions.[fnName].events.[http].integratedResponse  |            | √           |         |     |
| functions.[fnName].events.[http].cors                |            | √           |         |     |
| functions.[fnName].events.[http].role                | √          |             |         |     |
| functions.[fnName].events.[http].vesion              | √          |             |         |     |
|                                                      |            |             |         |     |
| functions.[fnName].events.[apigw]                    | √          | √           |         |     |
| functions.[fnName].events.[apigw].method             | ○ 附 1     | √           |         |     |
| functions.[fnName].events.[apigw].path               | ○          | √           |         |     |
| functions.[fnName].events.[apigw].serviceId          |            | √           |         |     |
| functions.[fnName].events.[apigw].timeout            |            | √           |         |     |
| functions.[fnName].events.[apigw].integratedResponse |            | √           |         |     |
| functions.[fnName].events.[apigw].cors               |            | √           |         |     |
|                                                      |            |             |         |     |
| functions.[fnName].events.[timer]                    | √          | √           |         |     |
| functions.[fnName].events.[timer].name               | √          |             |         |     |
| functions.[fnName].events.[timer].type               | √          |             |         |     |
| functions.[fnName].events.[timer].value              | √          | √           |         |     |
| functions.[fnName].events.[timer].enable             | √          | √           |         |     |
| functions.[fnName].events.[timer].payload            | √          |             |         |     |
| functions.[fnName].events.[timer].version            | √          |             |         |     |
|                                                      |            |             |         |     |
| functions.[fnName].events.[mq]                       | √          | √           |         |     |
| functions.[fnName].events.[mq].name                  | √          |             |         |     |
| functions.[fnName].events.[mq].topic                 | √          | √           |         |     |
| functions.[fnName].events.[mq].strategy              | √          |             |         |     |
| functions.[fnName].events.[mq].tags                  | √          |             |         |     |
| functions.[fnName].events.[mq].region                | √          |             |         |     |
| functions.[fnName].events.[mq].role                  | √          |             |         |     |
| functions.[fnName].events.[mq].version               | √          |             |         |     |
| functions.[fnName].events.[mq].enable                |            | √           |         |     |
|                                                      |            |             |         |     |
| functions.[fnName].events.[os]                       | √          | √           |         |     |
| functions.[fnName].events.[os].name                  | √          | √           |         |     |
| functions.[fnName].events.[os].bucket                | √          | √           |         |     |
| functions.[fnName].events.[os],events                | √          | √           |         |     |
| functions.[fnName].events.[os].filter.prefix         | √          | √           |         |     |
| functions.[fnName].events.[os].filter.suffix         | √          | √           |         |     |
| functions.[fnName].events.[os].role                  | √          |             |         |     |
| functions.[fnName].events.[os].version               | √          |             |         |     |
| functions.[fnName].events.[os].enable                |            | √           |         |     |
|                                                      |            |             |         |     |
|                                                      |            |             |         |     |
| layers                                               | √          | √           |         |     |
| layers.[layerName].name                              | √          | √           |         |     |
| layers.[layerName].path                              | √          | √           |         |     |
|                                                      |            |             |         |     |
| package.include                                      | √          | √           |         |     |
| package.exclude                                      | √          | √           |         |     |
| package.artifact                                     | √          | √           |         |     |
|                                                      |            |             |         |     |
| plugins[pluginsName]                                 | √          | √           |         |     |
|                                                      |            |             |         |     |
| aggregation.[fnName].deployOrigin                    | √          | √           |         |     |
| aggregation.[fnName].functions                       | √          | √           |         |     |
| aggregation.[fnName].functionsPattern                | √          | √           |         |     |
|                                                      |            |             |         |     |
| deployType                                           | √          | √           |         |     |
| deployType.type                                      | √          | √           |         |     |
| deployType.config                                    | √          | √           |         |     |
|                                                      |            |             |         |     |
|                                                      |            |             |         |     |

- 附 1：CLI 工具链在本地开发时支持此参数，但是发布时不会读取，需要去网关配置；[阿里云云开发平台](https://workbench.aliyun.com/)已经支持此参数进行发布

## service

主要是服务名信息，一个服务可以包含多个函数。

### 结构

```typescript
export type ServiceStructure =
  | string
  | {
      name: string;
      description?: string;
    };
```

### 字段描述

| **ServiceStructure** |        |              |
| -------------------- | ------ | ------------ |
| name                 | string | 必选，服务名 |
| description          | string | 描述         |
|                      |        |              |

### 示例

```yaml
service: serverless-hello-world // 简写
```

```yaml
service:
  name: serverless-hello-world
  description: 'some description'
```

## provider

描述云平台，运行时，权限，以及所有函数复用的信息。

### 结构

```typescript
export interface ProviderStructure {
  name: string;
  runtime: string;
  stage?: string;
  region?: string;
  timeout?: number;
  memorySize?: number;
  description?: string;
  role?: string;
  environment?: {
    [key: string]: string;
  };
  serviceId?: string;
  vpcConfig?: {
    vpcId: string;
    vSwitchIds: string[];
    securityGroupId: string;
  };
  internetAccess?: boolean;
  policies?: string | string[];
  logConfig?: {
    project: string;
    logstore: string;
  };
  nasConfig?:
    | 'auto'
    | {
        userId: number;
        groupId: number;
        mountPoints: Array<{
          serverAddr: string;
          mountDir: string;
        }>;
      };
}
```

### 字段描述

| **ProviderStructure** |        |                                                                         |
| --------------------- | ------ | ----------------------------------------------------------------------- |
| name                  | string | 必选，可以发布的平台信息，可选的有 `aliyun` ， `tencent` ，后续还会增加 |
| runtime               | string | 必选，函数的运行时                                                      |

默认值

- 阿里云：nodejs12（可选 nodejs6、nodejs8、nodejs10、nodejs12）
- 腾讯云：nodejs10（可选 nodejs6, nodejs8, nodejs10)

|
| stage | string | 全局发布的环境 |
| region | string | 部署的区域，腾讯云特有，比如  
ap-shanghai |
| timeout | number | 超时时间，单位 秒
默认值

- 阿里云：3
- 腾讯云:：3
  |
  | initTimeout | number | 阿里云字段，全局初始化函数超时时间，单位秒，默认 3 |
  | memorySize | number | 内存限制大小，单位 M，
  默认值：
- 阿里云：128
- 腾讯云：128
  |
  | description | string | 描述 |
  | role | string | 角色，事件源会使用该角色触发函数执行，请确保该角色有调用函数的权限。 |
  | environment | object | 全局环境变量 |
  | serviceId | string | 网关服务 Id，目前只有腾讯云用到 |
  | vpcConfig | object | 阿里云字段，vpcConfig 包含的属性包括： `vpcId` 、 `vSwitchIds`  以及 `securityGroupId`  属性 |
  | internetAccess | boolean | 阿里云字段，表示此服务是否可以访问公网。 |
  | policies | string | string[] | 阿里云字段，函数需要的阿里云管理的 RAM policies 或 RAM policy 文档的名称，将会被附加到该函数的默认角色上。如果设置了 Role 属性，则该属性会被忽略。 |
  | logConfig | object | 阿里云字段，函数执行的日志存储服务配置。 |
  | nasConfig | 'auto' | object | 阿里云字段，Nas 配置对象用来指定函数可以访问的 Nas 共享的文件系统。
  Nas 配置对象可配置的属性包括：`UserId`、`GroupId`、`MountPoints`。 |

:::info
腾讯云的 Node.js Runtime 版本我们做了映射，对应关系如下：

- nodejs10 -> Node.js10.15
- nodejs8 -> Node.js8.9
- node.js6 -> Node.js6.10
  :::

### 示例

aliyun fc 下

```yaml
provider:
  name: aliyun
  runtime: nodejs10
  memorySize: 128
  policies:
    - AliyunECSNetworkInterfaceManagementAccess
  vpcConfig:
    vpcId: 'vpc-j6cfu2g6tslzekh8grfmk'
    vSwitchIds: ['vsw-j6chkgsg9naj6gx49espd']
    securityGroupId: 'sg-j6ceitqs6ljyssm1apom'
  logConfig:
    project: localtestlog
    logstore: localteststore
  nasConfig:
    userId: 10003
    groupId: 10003
    mountPoints:
      - serverAddr: '012194b28f-xxxxx.cn-hangzhou.nas.aliyuncs.com:/'
        mountDir: '/mnt/test'
```

tencent

```yaml
provider:
  name: tencent
  runtime: Nodejs10
  memorySize: 128
  timeout: 10
  serviceId: xxxxx
  region: ap-shanghai
```

## functions

一个 functions 结构中包含多个 函数（function）。每个函数是一个对象（function）结构。
​

functions 中的字段和结构，在 midway v2 开始已经变为 `@ServerlessFunction` 和 `@ServerlessTrigger` 装饰器，下面的参数只是原始的描述。
​

### functions/function 结构

`functions`   和 `function`   结构是包含的关系，定义如下。

```typescript
export interface FunctionsStructure {
  [functionName: string]: FunctionStructure;
}

export interface FunctionStructure {
  handler: string;
  name?: string;
  description?: string;
  memorySize?: number;
  timeout?: number;
  runtime?: string;
  initTimeout?: number;
  environment?: {
    [key: string]: string;
  };
  events?: EventStructureType[];
  concurrency?: number;
  stage?: string;
}
```

### 字段描述

Functions 是一个由多个 function 组成的对象（非数组），**以函数名作为 key**，函数信息作为值。

单个函数结构如下：

| **FunctionStructure**               |                      |                                                                                                               |
| ----------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------- |
| handler                             | string               | 必选，指定入口文件，以 "." 分割，前半部分指定**入口文件名**，后半部分指定**入口函数名**。                     |
| name                                | string               | 函数名                                                                                                        |
| description                         | string               | 描述                                                                                                          |
| memorySize                          | string               | 内存限制大小，单位 M，如果不配置，默认取 provider.memorySize                                                  |
| timeout                             | number               | 超时时间，单位秒，                                                                                            |
| 如果不配置，默认取 provider.timeout |
| runtime                             | number               | 单独对函数指定运行时，同 provider.runtime                                                                     |
| initTimeout                         | number               | 阿里云字段，初始化函数超时时间，单位秒，默认 3                                                                |
| environment                         | object               | 函数级别的环境变量                                                                                            |
| concurrency                         | number               | 阿里云字段，为函数设置一个实例并发度 (最小为 1，最大为 100)，表示单个函数实例可以同时处理多少个请求，默认为 1 |
| stage                               | string               | 腾讯云字段，函数发布的环境                                                                                    |
| events                              | EventStructureType[] | 事件，函数触发器                                                                                              |
|                                     |                      |                                                                                                               |
|                                     |                      |                                                                                                               |

### 示例

以下结构描述了三个函数，每个函数的入口不同，内存限制不同。

```yaml
functions:
  hello1:
    handler: index.handler1
    memorySize: 128
  hello2:
    handler: index.handler2
    memorySize: 256
  hello3:
    handler: index.handler3
    memorySize: 512
```

##

## events

```typescript
export interface HTTPEvent {
  path?: string;
  method?: string | string[];
  role?: string;
  version?: string;
  serviceId?: string;
  cors?: boolean;
  timeout?: number;
  integratedResponse?: boolean;
}

export interface APIGatewayEvent extends HTTPEvent {}

export interface TimerEvent {
  type?: 'cron' | 'every' | 'interval';
  value: string;
  payload?: string;
  version?: string;
  enable?: boolean;
}

export interface LogEvent {
  source: string;
  project: string;
  log: string;
  retryTime?: number;
  interval?: number;
  role?: string;
  version?: string;
}

export interface OSEvent {
  name?: string;
  bucket: string;
  events: string;
  filter: {
    prefix: string;
    suffix: string;
  };
  enable?: boolean;
  role?: string;
  version?: string;
}

export interface MQEvent {
  topic: string;
  tags?: string;
  region?: string;
  strategy?: string;
  role?: string;
  version?: string;
  enable?: boolean;
}
```

### 字段描述

events 是一个由不同事件（触发器）组成的**对象数组**。这个对象的 key 为事件类型，值为事件描述。

| **EventStructureType** |           |                                         |
| ---------------------- | --------- | --------------------------------------- | ------------------------------------------------------------------------- | ------------ |
| key: eventName         | string    | 事件类型名                              |
| value: Event           | HTTPEvent |  MQEvent                                | TimerEvent ...                                                            | 事件描述结构 |
|                        |           |                                         |
| **HTTPEvent**          |           |                                         |
| name                   | string    | 触发器的名字                            |
| path                   | string    | 暴露 http path                          |
| method                 | string    | 暴露的 http 方法，比如 get/post         |
| role                   | string    | 此角色用来可以触发函数执行              |
| version                | string    | 阿里云云字段，服务版本，默认 "LATEST"。 |
| serviceId              | string    | 腾讯云字段，网关 Id                     |
| cors                   | boolean   | 腾讯云字段，是否开启网关 CORS           |
| timeout                | number    | 服务超时时间                            |
| integratedResponse     | boolean   | 腾讯云字段，是否开启集成相应，默认 true |
|                        |           |                                         |
| **APIGatewayEvent**    |           |                                         |
| 和 HTTPEvent 相同      |           |                                         |
|                        |           |                                         |
|                        |           |                                         |
| **TimerEvent**         |           |                                         |
| name                   | string    | 触发器的名字                            |
| type                   | 'cron'    | 'every'                                 | 必填，触发类型，分别代表 cron 表达式，固定时间间隔。腾讯云只支持  `cron`  |
| value                  | string    | 必填，对应触发的值。                    |

如果是 cron 类型，则填写 cron 表达式。
如果是 every 类型，则填写间隔时间，**带上单位** |
| payload | string | 可选，配置在网关，每次触发的内容 |
| version | string | 阿里云云字段，服务版本，默认 "LATEST"。 |
| enable | boolean | 是否默认开启，默认 true |
| | | |
| | | |
| **OSEvent** | | |
| name | string | 可选，触发器名 |
| bucket | string | 对象存储的 bucket 名 |
| events | string | 触发函数执行的事件名 |
| filter | {
   prefix: string;
   suffix: string;
 } | 对象过滤参数，满足过滤条件的 对象才可以触发函数，包含一个配置属性 key，表示过滤器支持过滤的对象键 (key)。 |
| enable | boolean | 是否默认开启，默认 true |
| role | string | 此角色用来可以触发函数执行 |
| version | string | 阿里云云字段，服务版本，默认 "LATEST"。 |
| | | |
| **MQEvent** | | |
| name | string | 触发器的名字 |
| topic | string | 接收消息的 topic |
| tags | string | 阿里云云字段，描述了该订阅中消息过滤的标签（标签一致的消息才会被推送） |
| region | string | 阿里云云字段，topic 所在的 region，如果不填，默认为和函数一样的 region |
| strategy | string | 阿里云云字段，调用函数的重试策略，可选值：BACKOFF_RETRY, EXPONENTIAL_DECAY_RETRY, 默认值为: BACKOFF_RETRY,  |
| role | string | 此角色用来可以触发函数执行 |
| version | string | 阿里云云字段，服务版本，默认 "LATEST"。 |
| enable | boolean | 是否默认开启，默认 true |
| | | |
| | | |
| | | |

### 示例

两个函数。

```yaml
functions:
  hello1:
    handler: index.handler1
    events:
      - http:					# http 触发器
          path: /foo
          method: get
  hello3:
    handler: index.handler3
    events:
      - mq:
        	topic: mytopic
```

HTTP 示例

```yaml
functions:
  hello1:
    handler: index.handler1
    events:
      - http:
          path: /foo
          method: get,post		// 阿里云支持同时多个，腾讯只支持单个
```

```yaml
functions:
  hello1:
    handler: index.handler1
    events:
      - http:
          path: /foo
          method: all					// 所有method
```

timer 示例

```yaml
service: serverless-hello-world
provider:
  name: fc
  runtime: nodejs8
  stage: dev
functions:
  hello3:
    handler: bbbbbb
    events:
      - timer:
          type: 'cron'
          value: '0 0 8 * * *'
          payload: 'test'
```

## layers

layer 作为 runtime 的扩展能力，用于在不同层面扩展 runtime 的接口。

### 结构

```typescript
export interface LayersStructure {
  [layerName: string]: {
    path: string;
    name?: string;
  };
}
```

### 字段描述

layers 是一个由多个 layer 组成的对象（非数组），**以 layer 名作为 key**，信息作为值。

| **LayersStructure** |        |            |
| ------------------- | ------ | ---------- |
| key: layerName      | string | layer 名   |
| value: path         | string | layer 路径 |
| value: name         | string | layer 名   |
|                     |        |            |
|                     |        |            |

### 示例

```yaml
layers:
  egg-layer:
    path: npm:@midwayjs/egg-layer@latest
```

## package

用于控制打包时，包含或者忽略某些文件，以及指定打包的最终产物的名称。

### 示例

```yaml
package:										# 打包配置
  include:										# 打包包含文件列表，默认为 package.json、构建后的代码和依赖
  	- resource/*
  exclude:										# 打包剔除文件列表
  	- test/*
  artifact: code.zip		                    # 打包后的压缩包文件名
```

## aggregation

设置聚合部署的结构，指定一些函数聚合在一起部署为一个新函数。

### 示例

```yaml
aggregation: # 聚合部署，详细内容请查看 聚合部署部分
  index: # 聚合部署聚合名称
    deployOrigin: false # 是否部署原始方法
    functions: # 聚合部署方法列表，比functionsPattern优先级要高
      - index # 聚合部署方法名
      - hello
    functionsPattern: # 聚合部署方法匹配规则，配置 functions 时无效
      - 'render*' # 使用 micromatch 匹配规则，即任何以render开头的函数
      - '!render2'
```

## resource

各个子项目依赖的资源信息配置。

:::info
暂时没有使用，作为预留项目。
:::

## deployType

定制的部署类型，目前是应用迁移方案在使用。

比如：

```yaml
deployType: egg
```

如果部署类型有更多的配置，则需要更为完整的写法，比如：

```yaml
deployType:
  type: static
  config:
    rootDir: public
```
