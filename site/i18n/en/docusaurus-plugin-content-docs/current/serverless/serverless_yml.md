# f.yml definition

## Overview

After discussion by the standardization group of Alibaba Group, combined with the existing design of `serverless.yml` in the community, a description file (**f.yml**) is used to describe the function information in the entire warehouse. The existing publishing and building tools will perform various processing based on this file at runtime.

The description file structure is based on [serverless.yml](https://serverless.com/framework/docs/providers/aws/guide/serverless.yml/). The goal is to build on the existing community reuse capability. It is hoped that the code of each platform can be as unified as possible, and a set of code can be deployed in multiple locations and expanded upward.

After midway serverless v2, `functions` paragraphs are gradually replaced by decorators, but the content in yml is still retained as the underlying capability.

The decorator will eventually be generated as the following yml structure, which can be compared and misplaced.

## General structure

Because different platforms have different triggers and different configuration information, the configuration is slightly different, but the overall configuration is basically the same.

Currently, the first-tier fields include:

- **service** the current service (function grouping), the standard application
- **provider** current service providers, such as aliyun,tencent, etc.
- The specific information of the **functions** function
- **layers**
- **resources** referenced resources
- **plugins** referenced plug-ins, serverless reserved
- **aggregation** Aggregate Deployment Fields
- Configuration information for **package** construction

It is roughly as follows:

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
      -http:
          path: /foo
          method:
            - GET
            - POST
  hello2:
    handler: entry.handler2
    events:
      -http:
          path: /foo
          method:
            - GET
            - POST
  hello3:
    handler: test.handler2
    events:
      -http:
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

## Platform field support

Due to the large number of fields, the following table counts all currently supported fields. The specific field descriptions can be found in the following more detailed table.

√ means that the tool chain has been supported, and ○ means that some support platforms have been supported, but the tool chain has not yet been supported.

| **Field** | **aliyun** | **tencent** | **aws** |     |
| ---------------------------------------------------- | ---------- | ----------- | ------- | --- |
| service.name | √ | √ |         |     |
| service.description | √ | √ |         |     |
|                                                      |            |             |         |     |
| provider.name | √ | √ |         |     |
| provider.runtime | √ | √ |         |     |
| provider.stage |            | √ |         |     |
| provider.region |            | √ |         |     |
| provider.credentials |            | √ |         |     |
| provider.timeout | √ | √ |         |     |
| provider.initTimeout | √ |             |         |     |
| provider.memorySize | √ | √ |         |     |
| provider.description | √ |             |         |     |
| provider.role | √ | √ |         |     |
| provider.environment | √ | √ |         |     |
| provider.serviceId |            | √ |         |     |
| provider.vpcConfig | √ |             |         |     |
| provider.vpcConfig.vpcId | √ |             |         |     |
| provider.vpcConfig.vSwitchIds | √ |             |         |     |
| provider.vpcConfig.securityGroupId | √ |             |         |     |
| provider.internetAccess | √ |             |         |     |
| provider.policies | √ |             |         |     |
| provider.logConfig.project | √ |             |         |     |
| provider.logConfig.logstore | √ |             |         |     |
| provider.nasConfig | √ |             |         |     |
| provider.nasConfig.userId | √ |             |         |     |
| provider.nasConfig.groupId | √ |             |         |     |
| provider.nasConfig.mountPoints | √ |             |         |     |
|                                                      |            |             |         |     |
| functions. [fnName] | √ | √ |         |     |
| functions. [fnName] .handler | √ | √ |         |     |
| functions. [fnName] .stage |            | √ |         |     |
| functions. [fnName] .name |            |             |         |     |
| functions. [fnName] .description | √ | √ |         |     |
| functions. [fnName] .memorySize | √ | √ |         |     |
| functions. [fnName] .timeout | √ |             |         |     |
| functions. [fnName] .runtime | √ |             |         |     |
| functions. [fnName] .initTimeout | √ |             |         |     |
| functions. [fnName] .environment | √ | √ |         |     |
| functions. [fnName] .concurrency | √ |             |         |     |
| functions. [fnName] .events | √ | √ |         |     |
|                                                      |            |             |         |     |
| functions. [fnName] .events. [http] | √ | √ |         |     |
| functions. [fnName] .events. [http] .name | √ |             |         |     |
| functions. [fnName] .events. [http] .method | √ | √ |         |     |
| functions. [fnName] .events. [http] .path | √ | √ |         |     |
| functions. [fnName] .events. [http] .serviceId |            | √ |         |     |
| functions. [fnName] .events. [http] .timeout |            | √ |         |     |
| functions. [fnName] .events. [http] .integratedResponse |            | √ |         |     |
| functions. [fnName] .events. [http] .cors |            | √ |         |     |
| functions. [fnName] .events. [http] .role | √ |             |         |     |
| functions. [fnName] .events. [http] .vesion | √ |             |         |     |
|                                                      |            |             |         |     |
| functions.[fnName].events.[http]  [][] | √ | √ |         |     |
| functions. [fnName] .events. [apigw] .method | ○ Attachment 1 | √ |         |     |
| functions. [fnName] .events. [apigw] .path | ○ | √ |         |     |
| functions. [fnName] .events. [apigw] .serviceId |            | √ |         |     |
| functions. [fnName] .events. [apigw] .timeout |            | √ |         |     |
| functions. [fnName] .events. [apigw] .integratedResponse |            | √ |         |     |
| functions. [fnName] .events. [apigw] .cors |            | √ |         |     |
|                                                      |            |             |         |     |
| functions. [fnName] .events. [timer] | √ | √ |         |     |
| functions. [fnName] .events. [timer] .name | √ |             |         |     |
| functions. [fnName] .events. [timer] .type | √ |             |         |     |
| functions. [fnName] .events. [timer] .value | √ | √ |         |     |
| functions. [fnName] .events. [timer] .enable | √ | √ |         |     |
| functions. [fnName] .events. [timer] .payload | √ |             |         |     |
| functions. [fnName] .events. [timer] .version | √ |             |         |     |
|                                                      |            |             |         |     |
| functions. [fnName] .events. [mq] | √ | √ |         |     |
| functions. [fnName] .events. [mq] .name | √ |             |         |     |
| functions. [fnName] .events. [mq] .topic | √ | √ |         |     |
| functions. [fnName] .events. [mq] .strategy | √ |             |         |     |
| functions.[fnName].events.[mq].tags[][] | √ |             |         |     |
| functions. [fnName] .events. [mq] .region | √ |             |         |     |
| functions. [fnName] .events. [mq] .role | √ |             |         |     |
| functions. [fnName] .events. [mq] .version | √ |             |         |     |
| functions. [fnName] .events. [mq] .enable |            | √ |         |     |
|                                                      |            |             |         |     |
| functions. [fnName] .events. [OS] | √ | √ |         |     |
| functions. [fnName] .events. [OS] .name | √ | √ |         |     |
| functions. [fnName] .events. [OS] .bucket | √ | √ |         |     |
| functions. [fnName] .events. [OS] ,events | √ | √ |         |     |
| functions. [fnName] .events. [OS] .filter.prefix | √ | √ |         |     |
| functions. [fnName] .events. [OS] .filter.suffix | √ | √ |         |     |
| functions. [fnName] .events. [OS] .role | √ |             |         |     |
| functions. [fnName] .events. [OS] .version | √ |             |         |     |
| functions. [fnName] .events. [OS] .enable |            | √ |         |     |
|                                                      |            |             |         |     |
|                                                      |            |             |         |     |
| layers | √ | √ |         |     |
| layers. [layerName] .name | √ | √ |         |     |
| layers. [layerName] .path | √ | √ |         |     |
|                                                      |            |             |         |     |
| package.include | √ | √ |         |     |
| package.exclude | √ | √ |         |     |
| package.artifact | √ | √ |         |     |
|                                                      |            |             |         |     |
| plugins [pluginsName] | √ | √ |         |     |
|                                                      |            |             |         |     |
| aggregation. [fnName] .deployOrigin | √ | √ |         |     |
| aggregation. [fnName] .functions | √ | √ |         |     |
| aggregation. [fnName] .functionsPattern | √ | √ |         |     |
|                                                      |            |             |         |     |
| deployType | √ | √ |         |     |
| deployType.type | √ | √ |         |     |
| deployType.config | √ | √ |         |     |
|                                                      |            |             |         |     |
|                                                      |            |             |         |     |

- Attachment 1: This parameter is supported when the CLI tool chain is developed on-premises, but it will not be read when it is published. You must go to the gateway to configure this parameter. [Alibaba Cloud Development Platform](https://workbench.aliyun.com/) supports this parameter for publishing.

## service

It mainly refers to the service name information. A service can contain multiple functions.

### Structure

```typescript
export type ServiceStructure =
  | string
  | {
      name: string;
      description?: string;
    };
```

### Field description

| **ServiceStructure** |        |              |
| -------------------- | ------ | ------------ |
| name | string | Required, service name |
| description | string | Description |
|                      |        |              |

### Example

```yaml
service: serverless-hello-world // Short
```

```yaml
service:
  name: serverless-hello-world
  description: 'some description'
```

## provider

Describes the cloud platform, runtime, permissions, and all function reuse information.

### Structure

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
  environment ?: {
    [key: string]: string;
  };
  serviceId?: string;
  vpcConfig ?: {
    vpcId: string;
    vSwitchIds: string[];
    securityGroupId: string;
  };
  internetAccess?: boolean;
  policies?: string | string[];
  logConfig ?: {
    project: string;
    logstore: string;
  };
  nasConfig ?:
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

### Field description

| **ProviderStructure** | Type | Default | Description |
| --------------------- | ---- | ------- | ----------- |
| name | `aliyun` \| `tencent` | - | Required, platform information that can be published will be added later. |
| runtime | Aliyun: nodejs6, nodejs8, nodejs10, nodejs12<br/>: nodejs6, nodejs8, nodejs10 | Aliyun: nodejs12<br/>: Tencent Cloud: nodejs10 | Required, runtime of function |
| stage | string | - | Global published environment |
| region | string | - | Tencent Cloud has special deployment areas, such as ap-shanghai |
| timeout | number | 3 | Timeout time, unit "seconds" |
| initTimeout | Number | 3 | Aliyun field, global initialization function timeout, in seconds |
| memorySize | number | 128 | Memory limit size, unit m |
| description | string | - | Description |
| role | string | - | role, the event source will use this role to trigger function execution, please ensure that the role has the permission to call the function.  |
| environment | object | - | Global environment variable |
| serviceId | string | - | Gateway service Id, currently only used by Tencent Cloud |
| vpcConfig | object | - | Alibaba Cloud fields. vpcConfig include `vpcId`, `vSwitchIds`, and `securityGroupId` attributes. |
| internetAccess | boolean | - | the alibaba cloud field indicates whether the service can access the internet.  |
| policies | string \| string [] | - | Aliyun field, the name of the RAM policies or RAM policy document that the function requires, will be attached to the default role of the function. If the Role property is set, the property is ignored.  |
| logConfig | object | - | alibaba cloud field, log storage service configuration for function execution.  |
| nasConfig | 'auto' \| object | - | Alibaba Cloud field, the Nas configuration object is used to specify the Nas shared file system that the function can access. The configurable properties of the Nas configuration object include: `UserId`, `GroupId`, `MountPoints`. |

:::info
We have mapped the Node.js Runtime version of Tencent Cloud, and the corresponding relationship is as follows:

- nodejs10 -> Node.js10.15
- nodejs8 -> Node.js8.9
- node.js6 -> Node.js6.10

:::

### Example

Under aliyun fc

```yaml
provider:
  name: aliyun
  runtime: nodejs10
  memorySize: 128
  policies:
    -AliyunECSNetworkInterfaceManagementAccess
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
      -serverAddr: '012194b28f-xxxxx.cn-hangzhou.nas.aliyuncs.com :/'
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

A functions structure contains multiple functions (function). Each function is an object (function) structure.


The fields and structures in the functions have changed to `@ServerlessFunction` and `@ServerlessTrigger` decorators at midway v2. The following parameters are only the original descriptions.


### functions/function structure

`functions` and `function` structures are inclusive relationships, defined as follows.

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
  environment ?: {
    [key: string]: string;
  };
  events?: EventStructureType[];
  concurrency?: number;
  stage?: string;
}
```

### Field description

A Functions is an object (non-array) composed of multiple function, **with function name as key** and function information as value.

The structure of a single function is as follows:

| **FunctionStructure** |                      |                                                                                                               |
| ----------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------- |
| name | string | Required. The entry file is divided by ".". The **entry file name** is specified in the first half and the **entry function name** is specified in the second half.  |
| name | string | Function name |
| description | string | Description |
| memorySize | string | Memory limit size, unit m, if not configured, default provider.memorySize |
| timeout | number | Timeout, in seconds,  |
| If not configured, provider is taken by default. timeout |||
| runtime | number | When the function is assigned to run separately, the same provider.runtime |
| initTimeout | number | alibaba cloud field, initialization function timeout, unit seconds, default 3 |
| environment | object | Function-level environment variables |
| concurrency | number | Aliyun field, which sets the concurrency of an instance for a function (minimum 1, maximum 100), indicating how many requests a single function instance can handle at the same time. The default value is 1 |
| stage | string | Tencent cloud field, the environment in which the function is published. |
| events | EventStructureType [] | Event, function trigger |
|                                     |                      |                                                                                                               |
|                                     |                      |                                                                                                               |

### Example

The following structure describes three functions, each with a different entry and a different memory limit.

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

### Field description

Events is an **object array** composed of different events (triggers). The key of this object is the event type and the value is the event description.

| **EventStructureType** |           |                                         |
| ---------------------- | --------- | --------------------------------------- |
| key: eventName | string | Event type name |
| value: Event | HTTPEvent \| MQEvent \| TimerEvent... | Event description structure |
|                        |           |                                         |
| **HTTPEvent** |           |                                         |
| name | string | The name of the trigger |
| path | string | Expose http path |
| method | string | exposed http methods, such as get/post |
| role | string | This role is used to trigger function execution |
| version | string | Alibaba Cloud field, service version, default "LATEST".  |
| serviceId | string | Tencent cloud field, gateway Id |
| cors | boolean | Tencent cloud field, whether to open gateway CORS |
| timeout | number | Service timeout |
| integratedResponse | boolean | Tencent cloud field, whether to turn on integration corresponding, default true |
|                        |           |                                         |
| **APIGatewayEvent** |           |                                         |
| Same as HTTPEvent |           |                                         |
|                        |           |                                         |
|                        |           |                                         |
| **TimerEvent** |           |                                         |
| name | string | The name of the trigger |
| type | 'cron' \| 'every' | required, trigger type, respectively represent cron expressions, fixed time interval. Tencent Cloud only supports `Cron` |
| value | string | Required, corresponding to the trigger value. If it is of cron type, fill in the cron expression. If it is of the every type, enter the interval and **bring the unit**. |
| payload | string | Optional, configure the content of each trigger in the gateway. |
| version | string | Alibaba Cloud field, service version, default "LATEST".  |
| enable | boolean | whether to turn on by default, the default is true. |
| | | |
| **OSEvent** | | |
| name | string | Optional, trigger name |
| bucket | string | The bucket name of the object store. |
| events | string | The name of the event that triggered the execution of the function. |
| Filter | {prefix: string; suffix: string;} | the object filtering parameter. only objects that meet the filtering criteria can trigger the function. it contains a configuration property key, which indicates the object key that the filter supports filtering.  |
| enable | boolean | whether to turn on by default, the default is true. |
| role | string | This role is used to trigger function execution |
| version | string | Alibaba Cloud field, service version, default "LATEST".  |
| | | |
| **MQEvent** | | |
| name | string | The name of the trigger |
| topic | string | topic for receiving messages |
| tags | string | the alibaba cloud field, which describes the tags of message filtering in the subscription (only messages with consistent tags will be pushed) |
| region | string | Alibaba Cloud field, the region where the topic is located, if not filled in, the default is the same region as the function. |
| strategy | string | Aliyun field, retry policy for calling the function, optional value: BACKOFF_RETRY, EXPONENTIAL_DECAY_RETRY, default value: BACKOFF_RETRY, |
| role | string | This role is used to trigger function execution |
| version | string | Alibaba Cloud field, service version, default "LATEST".  |
| enable | boolean | whether to turn on by default, the default is true. |
| | | |

### Example

Two functions.

```yaml
functions:
  hello1:
    handler: index.handler1
    events:
      - http: # http trigger
          path: /foo
          method: get
  hello3:
    handler: index.handler3
    events:
      - mq:
        	topic: mytopic
```

HTTP example

```yaml
functions:
  hello1:
    handler: index.handler1
    events:
      - http:
          path: /foo
          Method: get,post # Aliyun supports multiple at the same time, Tencent only supports single
```

```yaml
functions:
  hello1:
    handler: index.handler1
    events:
      - http:
          path: /foo
          method: all # all method
```

timer example

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

Layer, as a runtime extension capability, is used to extend runtime interfaces at different levels.

### Structure

```typescript
export interface LayersStructure {
  [layerName: string]: {
    path: string;
    name?: string;
  };
}
```

### Field description

Layers is an object (not an array) composed of multiple layers, **using the layer name as the key** and the information as the value.

| **LayersStructure** |        |            |
| ------------------- | ------ | ---------- |
| key: layerName | string | layer name |
| value: path | string | layer path |
| value: name | string | layer name |

### Example

```yaml
layers:
  egg-layer:
    path: npm:@midwayjs/egg-layer@latest
```

## package

Used to control packaging, include or ignore certain files, and specify the name of the final product to be packaged.

### Example

```yaml
package: # Package Configuration
  include: # Package contains a list of files, which defaults to package.json, built code, and dependencies.
  	- resource /*
  exclude: # Package and Reject File List
  	- test /*
  artifact: code.zip # packaged compressed package file name
```

## Aggregation

Set the structure of the aggregation deployment and specify that some functions are aggregated together and deployed as a new function.

### Example

```yaml
aggregation: # Aggregate deployment, please see the Aggregate Deployment section for details
  index: # Aggregate Deployment Aggregate Name
    deployOrigin: false# whether to deploy the original method
    functions: # Aggregate deployment method list, higher than functionsPattern priority
			- index # Aggregate deployment method name
      - hello
    functionsPattern: # Aggregate deployment method matching rule, invalid when configuring functions
      - 'render*' # uses micromatch matching rules, that is, any function that starts with render
      - '!render2'
```

## resource

Resource information configuration that each sub-project depends on.

:::info
Not used for the time being, as a reserved item.
:::

## deployType

The custom deployment type is currently used in the application migration scheme.

For example:

```yaml
deployType: egg
```

If the deployment type has more configurations, a more complete writing is required, such:

```yaml
deployType:
  type: static
  config:
    rootDir: public
```
