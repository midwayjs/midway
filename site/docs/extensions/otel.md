# 链路追踪

Midway 采用社区最新的 [open-telemetry](https://opentelemetry.io/) 方案，其前身是知名的 OpenTracing 和 OpenCensus 规范，现阶段也是 CNCF 的孵化项目，社区许多知名的大公司如 Amazon，Dynatrace，Microsoft，Google，Datadog，Splunk 等都有使用。

 [open-telemetry](https://opentelemetry.io/) 提供了通用的 Node.js 接入方案，以供应商无关的方式将数据接收，处理，导出，支持向一个或多个开源或者商业化的采集端发送可观测的数据（比如阿里云 SLS，Jaeger，Prometheus，Fluent Bit 等）。

Midway 提供了接入 [open-telemetry](https://opentelemetry.io/) 的 Node.js 方案，并提供了一些简单的使用 API。

:::info

[open-telemetry](https://opentelemetry.io/) 的 Tracing 部分当前 Node.js SDK 已经 Release 1.0.0，可以在生产使用，Metrics 部分未正式发布，我们依旧在跟进（编码）中。

:::



## 使用须知

[open-telemetry](https://opentelemetry.io/) 基于 Node.js 的 Async_Hooks 的稳定 API 实现，经过我们的测试，在最新的 Node.js v14/v16 性能影响已经很小，可以在生产使用，在 v12 情况下虽然可以使用，但是性能依旧有不小的损失，请尽可能在 Node.js >= v14 的版本下使用。



## 安装基础依赖

```bash
# Node.js 的 api 抽象
$ npm install --save @opentelemetry/api

# Node.js 的 api 实现
$ npm install --save @opentelemetry/sdk-node

# 常用 Node.js 模块的埋点实现
$ npm install --save @opentelemetry/auto-instrumentations-node

# jaeger 输出器
$ npm install --save @opentelemetry/exporter-jaeger
```

以上的包均为  [open-telemetry](https://opentelemetry.io/) 的官方包。



## 启用 open-telemetry

 [open-telemetry](https://opentelemetry.io/) 的模块请尽可能加在代码的最开始（比框架还要早），所以在不同场景中，我们有不同的添加方式。



### 使用 bootstrap 部署

如果使用 `bootstrap.js` 部署，你可以加在 `bootstrap.js` 的最顶部，示例代码如下。

```typescript
const process = require('process');
const opentelemetry = require('@opentelemetry/sdk-node');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions')
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger')

// Midway 启动文件
const { Bootstrap } = require('@midwayjs/bootstrap');

// https://www.npmjs.com/package/@opentelemetry/exporter-jaeger
const tracerAgentHost = process.env['TRACER_AGENT_HOST'] || '127.0.0.1'
const jaegerExporter = new JaegerExporter({
  host: tracerAgentHost,
});

// 初始化一个 open-telemetry 的 SDK
const sdk = new opentelemetry.NodeSDK({
  // 设置追踪服务名
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'my-app',
  }),
  // 配置当前的导出方式，比如这里配置了一个输出到控制台的，也可以配置其他的 Exporter，比如 Jaeger
  traceExporter: new ConsoleSpanExporter(),
  // 配置当前导出为 jaeger
  // traceExporter: jaegerExporter,

  // 这里配置了默认自带的一些监控模块，比如 http 模块等
  // 若初始化时间很长，可注销此行，单独配置需要的 instrumentation 条目
  instrumentations: [getNodeAutoInstrumentations()]
});

// 初始化 SDK，成功启动之后，再启动 Midway 框架
sdk.start()
  .then(() => {
    return Bootstrap
      .configure(/**/)
      .run();
  });

// 在进程关闭时，同时关闭数据采集
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
```



### 使用 egg-scripts 部署

egg-scripts 由于未提供入口部署，必须采用 `--require` 的形式加载额外的文件。

我们在根目录添加一个 `otel.js` （注意是 js 文件），内容如下。

```javascript
const process = require('process');
const opentelemetry = require('@opentelemetry/sdk-node');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

// 初始化一个 open-telemetry 的 SDK
const sdk = new opentelemetry.NodeSDK({
  // 配置当前的导出方式，比如这里配置了一个输出到控制台的，也可以配置其他的 Exporter，比如 Jaeger
  traceExporter: new ConsoleSpanExporter(),
  // 这里配置了默认自带的一些监控模块，比如 http 模块等
  instrumentations: [getNodeAutoInstrumentations()]
});

// 初始化 SDK
sdk.start()
  .then(() => console.log('Tracing initialized'))
  .catch((error) => console.log('Error initializing tracing', error));

// 在进程关闭时，同时关闭数据采集
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
```

修改 `package.json` 中的启动命令。

```json
{
  // ...
  "scripts": {
    "start": "egg-scripts start --daemon --title=**** --framework=@midwayjs/web --require=./otel.js",
  },
}
```

### 开发调试入口

`midway-bin` 使用 `--entryFile` 参数指定入口文件

例如 `package.json` 文件
```json
{
  "scripts": {
    "start": "cross-env NODE_ENV=local midway-bin dev --ts --entryFile=bootstrap.js"
  }
}
```

## 常用概念

[open-telemetry](https://opentelemetry.io/) 提供了一些抽象封装，将监控的整个过程包装为几个步骤，每个步骤都可自定义配置，其也有一些用户不太理解的术语，在下面做一些解释。

完整的英文概念请参考 [Concepts](https://opentelemetry.io/docs/concepts/)。



### API

用于生成和关联 Tracing、Metrics 和 Logs 记录数据的数据类型和操作的一组 API 抽象，具体表现为 `@opentelemetry/api` 这个包，里面是一些接口和空实现。

### SDK

API 的特定语言实现，比如 Node.js 的实现（`@opentelemetry/sdk-node`），其他监控平台的采集  SDK 实现等等。

### Instrumentations

[open-telemetry](https://opentelemetry.io/) 提供了一些常见库的 shim 代码，使用 hooks 或者 monkey-patching 的方法来拦截方法，自动在特定方法调用时保存链路数据，支持 http，gRPC ， redis，mysql 等模块，用户直接配置即可使用。

比如上面示例引入的 `@opentelemetry/auto-instrumentations-node` 就是一个已经默认封装好常用库的 instrumentations 集合包，里面包括了大部分会用到的库，具体的依赖请参考 [Github](https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/metapackages/auto-instrumentations-node/package.json)。

### Exporter

将接收到的链路数据发送到特定端的实现，比如  Jaeger，zipkin 等。



## 示例



### 添加三方 instrumentation

在 SDK 初始化时，添加到 `instrumentations ` 数组中即可。

```typescript
const { RedisInstrumentation } = require('@opentelemetry/instrumentation-redis');
// ...

// 初始化一个 open-telemetry 的 SDK
const sdk = new opentelemetry.NodeSDK({
  // ...

  // 这里仅是添加的示例，如果使用了 auto-instrumentations-node，已经包含了下面的 instrumentation
  instrumentations: [
    new RedisInstrumentation(),
  ]
});
```



### 添加 Jaeger Exporter

这里以 Jaeger Exporter 作为示例，其他 Exporter 类似。

先添加依赖。

```bash
$ npm install --save @opentelemetry/exporter-jaeger @opentelemetry/propagator-jaeger
```

在 SDK 中配置。

```typescript
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { JaegerPropagator } = require('@opentelemetry/propagator-jaeger');
// ...

const exporter = new JaegerExporter({
  tags: [], // optional
  // You can use the default UDPSender
  host: 'localhost', // optional
  port: 6832, // optional
  // OR you can use the HTTPSender as follows
  // endpoint: 'http://localhost:14268/api/traces',
  maxPacketSize: 65000 // optional
});

// 初始化一个 open-telemetry 的 SDK
const sdk = new opentelemetry.NodeSDK({
  traceExporter: exporter,
  textMapPropagator: new JaegerPropagator()
  // ...
});
```

具体参数请参考：

- [opentelemetry-exporter-jaeger](https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-exporter-jaeger/README.md)
- [opentelemetry-propagator-jaeger](https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-propagator-jaeger/README.md)



### 阿里云 ARMS

阿里云应用实时监控服务（[ARMS](https://www.aliyun.com/product/arms/)）已经支持了 open-telemetry 格式的指标，同时提供一个 sdk 进行接入。

首先，安装 `opentelemetry-arms`。

```bash
# arms sdk
$ npm install --save opentelemetry-arms
```

然后在启动时添加环境变量参数以及 `-r` 参数即可。

```bash
$ SERVICE_NAME=nodejs-opentelemetry-express AUTHENTICATION=****  ENDPOINT=grpc://**** node  -r opentelemetry-arms bootstrap.js
```

:::tip

- 1、这种方式接入，无需在` bootstrap.js` 中添加代码。
- 2、默认 sdk 仅提供了 http/express/koa 模块的链路支持，未包含其他 instrumentations，如有需求，可以拷贝源码至 `bootstrap.js` 中自定义。

:::



## 装饰器支持

Midway 针对用户侧的需求，添加一个装饰器用于增加链路节点。

先安装依赖。

```bash
$ npm i @midwayjs/otel@3 --save
```

启用 `otel` 组件。

```typescript
import { Configuration } from '@midwayjs/decorator';
import * as otel from '@midwayjs/otel';

@Configuration({
  imports: [
    // ...
    otel
  ]
})
export class MainConfiguration {
}
```

Otel 组件提供了一个 @Trace 装饰器，可以添加在方法上。

```typescript
export class UserService {

  @Trace('user.get')
  async getUser() {
    // ...
  }
}
```

该装饰器需要传入一个节点名字，这样链路会自动添加一个该方法的链路节点，并记录执行的时间，方法执行成功或者失败。



