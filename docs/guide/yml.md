# f.yml


## 概述

经过阿里集团标准化小组的讨论，结合社区 `serverless.yml` 的已有设计，通过一个描述文件 (**f.yml**) 来描述整个仓库中的函数信息，现有的发布构建工具，运行时都会基于此文件进行各种处理。

描述文件结构基于 [serverless.yml](https://serverless.com/framework/docs/providers/aws/guide/serverless.yml/)，目标是在现有社区化复用能力之上，希望各个平台的代码能尽可能统一，一套代码可以多处部署，并向上扩展。


## 大体结构

由于不同平台的触发器不同，配置信息也不同，配置略微有些差别，但是整体基本一致。

目前第一层字段包括：

- **service**  当前的服务（函数分组），对标应用
- **provider** 当前的服务提供上，比如 aliuyun，tecent 等。
- **functions** 函数的具体信息
- **layers** 具体的layer 层配置
- **resources**  引用的资源
- **plugins**  引用的插件，serverless 预留
- **aggregation** 聚合部署字段
- **package**  构建的配置信息
- **custom** 其他自定义信息

大体如下：

```yaml
service: serverless-hello-world

provider:
  name: fc
  runtime: nodejs8
  stage: dev
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
    path: npm:@ali/market-layer@latest

custom:
  customDomain:
    domainName: midway-fc.alibaba-inc.com

```


## service

主要是服务名信息，一个服务可以包含多个函数。


### 结构

```typescript
export type ServiceStructure = string | {
  name?: string;
  description?: string;
};
```


### 字段描述
| **ServiceStructure** |  |  |
| --- | --- | --- |
| name | string | 必选，服务名 |
| description | string | 描述 |
|  |  |  |


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
}
```


## 字段描述
| **ProviderStructure** |  |  |
| --- | --- | --- |
| name | string | 必选，可以发布的平台信息，可选的有 aliyun，tecent，后续还会增加" |
| runtime | string | 必选，函数的运行时，比如 aliyun 提供 "nodejs8" |
| stage | string | 发布的环境，aliyun fc 默认 dev 等。 |
| region | string | 部署的区域 |
| timeout | number | 超时时间，单位秒，默认时间由各个平台定 |
| memorySize | number | 内存限制大小，单位M |
| description | string | 描述 |
| role | string | 角色，涉及权限部分，目前 aliyun 有用到 |


### 示例

aliyun fc 下

```yaml
provider:
  name: aliyun
  runtime: nodejs8
```

tencent

```yaml
provider:
  name: tencent
  runtime: Nodejs8.9
```


## functions


### functions/function 结构

`functions`  和 `function`  结构。

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
  events?: EventStructureType[];
}

```


### 触发器结构

```typescript
export type EventType = 'http' | 'mq' | 'schedule';

export interface EventStructureType {
  [eventName: string]: HTTPEvent | MQEvent | ScheduleEvent;
}

export interface HTTPEvent {
  path?: string;
  method?: string | string [];
}

export interface MQEvent {
  group?: string;
  topic?: string;
  tag?: string;
}

export interface ScheduleEvent {
	type: 'cron' | 'every';
  value: string;
  payload?: string;
}
```


### 字段描述

Functions 是一个由多个 function 组成的对象（非数组），**以函数名作为 key**，函数信息作为值。

单个函数结构如下：

| **FunctionStructure** |  |  |
| --- | --- | --- |
| handler | string | 必选，指定入口文件，以 "." 分割，前半部分指定**入口文件名**，后半部分指定**入口函数名**。 |
| name | string | 函数名，集团内目前用不着 |
| description | string | 描述 |
| memorySize | string | 内存限制大小，单位M |
| timeout | number | 超时时间，单位秒，默认时间由各个平台定 |
| runtime | number | 单独对函数指定运行时 |
| events | EventStructureType[] | 事件，函数触发器 |
| layers | string[] | 当前函数启用的 layer 数组 |
|  |  |  |

events 是一个由不同事件（触发器）组成的**对象数组**。这个对象的 key 为事件类型，值为事件描述。

| **EventStructureType** |  |  |
| --- | --- | --- |
| key: eventName | string | 事件类型名 |
| value: Event | HTTPEvent &#124;  MQEvent | 事件描述结构 |
|  |  |  |
| **HTTPEvent** |  |  |
| path | string | 暴露 http path |
| method | string | 暴露的 http 方法，比如 get/post |
|  |  |  |
| **MQEvent** |  |  |
| group | string | 接收 metaq 消息的分组 |
| topic | string | 接收 metaq 消息的 topic |
| tag | string | 接收 metaq 消息的 tag，用竖线分割 |
|  |  |  |
| **ScheduleEvent** |  |  |
| type | string | 必填，触发类型，可以选择 'cron'，'every' |
| value | string | 必填，对应触发的值。<br />如果是 cron类型，则填写 cron 表达式。<br />如果是 every 类型，则填写间隔时间，**带上单位** |
| payload | any | 可选，配置在网关，每次触发的内容 |
|  |  |  |



```yaml
schedule
  type: 'cron' | 'every',
  value: '1m',
  payload?: xxxx
```




### 示例

三个函数。

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
      - metaq:
      	group: mygroup
        topic: mytopic
        tag: '*'

```


schedule 示例

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
      - schedule:
          type: 'cron'
          value: '0 0 8 * * *'
          payload: 'test'
```

### FC 下的特殊情况

**FC 在未绑定自定义域名时，无法解析 path，只能通过自动生成的路由访问。**


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

| **LayersStructure** |  |  |
| --- | --- | --- |
| key: layerName | string | layer 名 |
| value: path | string | layer 路径 |
| value: name | string | layer 名 |
|  |  |  |
|  |  |  |


### 示例

```yaml
layers:
  egg-layer:
    path: oss:@midwayjs/egg-layer@latest
  test-layer:
    path: npm:test-layer@latest
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
aggregation:									# 聚合部署，详细内容请查看 聚合部署部分
  index:											# 聚合部署聚合名称
    deployOrigin: false				# 是否部署原始方法
    functions:								# 聚合部署方法列表，比functionsPattern优先级要高
      - index									# 聚合部署方法名
      - hello
    functionsPattern:         # 聚合部署方法匹配规则，配置 functions 时无效
      - 'render*'             # 使用 micromatch 匹配规则，即任何以render开头的函数
      - '!render2'
```


## resource

各个子项目依赖的资源信息配置。


## custom

待定。
