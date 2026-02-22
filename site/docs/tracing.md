# 链路追踪

从 Midway v4 开始，框架侧 tracing 能力已合并到 `@midwayjs/core`，不再需要安装和启用 `@midwayjs/otel` 组件。

## 使用须知

- Midway 会自动在入口/出口创建和传播 span。
- `tracing.enable` 是全局总开关（只控制“是否开启 tracing”）。
- 协议级行为在各组件里配置（例如 `koa.tracing`、`grpc.tracing`、`kafka.tracing`），`core` 不区分具体协议。
- 各组件可通过 `<component>.tracing.enable` 单独开关，也可以配置 `meta`、`extractor`、`injector`。
- 如果你需要在 Jaeger/Zipkin/OTLP 平台看到链路，仍需初始化 OpenTelemetry SDK 并配置 exporter。

## OpenTelemetry 基础概念

- Trace：一次完整请求链路，包含多个 Span。
- Span：链路中的一个操作节点，记录开始/结束时间、状态和属性。
- Context Propagation：上下文传播，把上游 Trace 信息透传到下游（HTTP header、MQTT properties、gRPC metadata 等）。
- Attributes：Span 上的键值属性，用于检索和过滤。
- TraceId：Trace 的全局唯一 ID，用于关联整条链路。

## 快速开始

### 1) 开启框架 tracing（默认已开启）

```typescript
// src/config/config.default.ts
export default {
  tracing: {
    enable: true,
    onError: 'ignore', // 或 throw
    logOnError: false,
  },
};
```

### 2) 组件级开关

```typescript
// src/config/config.default.ts
export default {
  tracing: {
    enable: true, // 全局总开关
  },
  koa: {
    tracing: {
      enable: true,
    },
  },
  kafka: {
    tracing: {
      enable: false, // 单独关闭 kafka tracing
    },
  },
};
```

开关规则：

- `tracing.enable=false`：全局关闭（所有组件都不产出 span）。
- `tracing.enable=true`：由各组件 `tracing.enable` 决定是否启用。

### 3) 导出到控制台（最简示例）

按本页的 `bootstrap.js` 初始化方式，你需要安装以下依赖：

```bash
$ npm install --save @opentelemetry/api @opentelemetry/sdk-trace-node @opentelemetry/sdk-trace-base
```

```json
{
  "dependencies": {
    "@opentelemetry/api": "latest",
    "@opentelemetry/sdk-trace-node": "latest",
    "@opentelemetry/sdk-trace-base": "latest"
  }
}
```

- `@opentelemetry/api`
- `@opentelemetry/sdk-trace-node`
- `@opentelemetry/sdk-trace-base`

`bootstrap.js` 示例：

```javascript
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} = require('@opentelemetry/sdk-trace-base');
const { Bootstrap } = require('@midwayjs/bootstrap');

const provider = new NodeTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register();

Bootstrap.configure().run();
```

启动后你会看到应用正常启动日志。真正的 tracing 输出会在有请求/消息进入后打印。

例如请求一次接口后，控制台会出现类似内容（不同版本字段会略有差异）：

```text
Span: {
  name: 'GET /api/user',
  kind: 1,
  traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
  parentId: undefined,
  attributes: { 'midway.protocol': 'http' },
  status: { code: 1 }
}
```

你可以重点看这几个字段，确认链路已接通：

- `traceId`：存在且是 32 位十六进制字符串。
- `name`：能对应到你的请求/任务。
- `attributes.midway.protocol`：能看到 `http` / `grpc` / `kafka` 等协议标记。

如果没有看到 span 输出，优先检查：

- `provider.register()` 是否在 `Bootstrap.configure().run()` 之前执行。
- 代码是否真的走到了被 tracing 覆盖的入口（例如发起了一次 HTTP 请求）。

:::tip

在 `dev` 模式下，主进程控制台无法看到这些 span 输出（`dev` 不走这里的 `bootstrap.js` 初始化代码）。

:::

### 4) 对接观测平台（按需）

常见 exporter：

- OTLP/HTTP：`@opentelemetry/exporter-trace-otlp-http`
- OTLP/gRPC：`@opentelemetry/exporter-trace-otlp-grpc`
- Jaeger：`@opentelemetry/exporter-jaeger`
- Zipkin：`@opentelemetry/exporter-zipkin`

下面以 Jaeger 为例：

1. 安装 Jaeger exporter 依赖（示例）

```bash
$ npm install --save @opentelemetry/exporter-jaeger
```

```json
{
  "dependencies": {
    "@opentelemetry/exporter-jaeger": "latest"
  }
}
```

2. 修改 `bootstrap.js`，把 Console exporter 替换为 Jaeger exporter

```javascript
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { Bootstrap } = require('@midwayjs/bootstrap');

const exporter = new JaegerExporter({
  host: process.env.JAEGER_AGENT_HOST || '127.0.0.1',
  port: Number(process.env.JAEGER_AGENT_PORT || 6832),
});

const provider = new NodeTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

Bootstrap.configure().run();
```

3. 验证是否生效

- 启动应用后发起一次请求。
- 打开 Jaeger UI（通常是 `http://127.0.0.1:16686`）。
- 按服务名检索，确认能看到对应 span。

## 框架能力

### ctx.traceId

`@midwayjs/core` 提供 `ctx.traceId` 字段。

所有使用 Midway 上下文的 framework 都可读取该字段（例如 web、koa、express、ws、grpc、faas 等）。

```typescript
ctx.traceId => '4bf92f3577b34da6a3ce929d0e0e4736'
```

### @Trace 装饰器

```typescript
import { Trace } from '@midwayjs/core';

export class UserService {
  @Trace('user.get')
  async getUser() {
    // ...
  }
}
```

### MidwayTraceService

```typescript
import { Inject, MidwayTraceService } from '@midwayjs/core';

export class UserService {
  @Inject()
  traceService: MidwayTraceService;
}
```

## 进阶配置

### 自定义 meta 信息

你可以把业务信息加到链路里（例如用户 ID、租户 ID、队列名）。这些信息最终会出现在 tracing 平台里，方便检索和排查。

`meta` 有 3 种常见写法：

1. 固定写死
适合所有场景都一样的字段。

```typescript
meta: {
  'biz.app': 'user-center',
}
```

2. 用函数动态生成
适合根据当前请求动态决定字段。

```typescript
meta: ({ protocol, direction }) => ({
  'biz.protocol': protocol,
  'biz.direction': direction,
})
```

3. 分入口/出口分别配置
适合入口和出口要打不同字段。

```typescript
meta: {
  common: { 'biz.app': 'user-center' },
  entry: { 'biz.side': 'in' },
  exit: { 'biz.side': 'out' },
}
```

上面函数里常用参数有：

- `direction`：当前是入口（`entry`）还是出口（`exit`）
- `protocol`：当前协议（比如 `http`、`grpc`、`kafka`、`redis`）
- `ctx`：当前上下文（入口场景常用）
- `request` / `response`：请求和响应对象
- `custom`：组件补充信息（如 `queueName`、`eventName`、`clientName`）

注意：`meta` 最终只会保留字符串、数字、布尔值。空值会被忽略。

组件级 `meta` 示例：

```typescript
// src/config/config.default.ts
export default {
  koa: {
    tracing: {
      meta: {
        common: ({ ctx }) => ({
          'biz.app': 'user-center',
          'biz.userId': (ctx as any)?.user?.id ?? 'anonymous',
        }),
        entry: ({ spanName }) => ({
          'biz.entry.span': spanName,
        }),
        exit: ({ spanName }) => ({
          'biz.exit.span': spanName,
        }),
      },
    },
  },
  redis: {
    tracing: {
      meta: ({ custom }) => ({
        'biz.redis.client': (custom as any)?.clientName ?? 'default',
      }),
    },
  },
};
```

### 自定义入口/出口上下文位置（extractor / injector）

这两个配置是给“上下文传播”用的：

- `extractor`：入口读取。Midway 在创建入口 span 前调用，用它决定“从哪里读取上游 trace 信息”。
- `injector`：出口写入。Midway 在发送下游请求/消息前调用，用它决定“往哪里写 trace 信息”。

什么时候需要你自己配：

- 默认行为能满足你，就不用配。
- 你的 header/metadata 结构比较特殊，需要改读取位置或写入位置时再配。
- 不同协议要走不同字段时（例如 HTTP 从 `headers`，gRPC 从 `metadata`，Kafka 从 `message.headers`）。

回调参数（最常用）：

- `request`：当前请求/消息对象。
- `response`：当前响应对象（HTTP/WS 常见）。
- `ctx`：当前上下文对象（框架相关）。
- `carrier`：组件默认 carrier（部分组件会提供）。
- `custom`：组件附加信息（如 `queueName`、`eventName`、`clientName`）。

回调返回值要求：

- 返回一个可读写的键值对象（例如普通对象、headers 对象、metadata 容器）。
- 返回 `undefined` 时，组件会回退到默认 carrier。

默认对照（当前实现）

先看入口（extractor，读取）：

默认情况下，Midway 使用 OpenTelemetry 全局 propagator。未自定义时通常是 W3C：

- `traceparent`
- `tracestate`
- `baggage`

可以直接理解为：默认就是从各协议载体里的同名字段读取链路信息。  
例如 HTTP Header 里的 `traceparent`，gRPC metadata 里的 `traceparent`，Kafka/RabbitMQ 消息 headers 里的 `traceparent`。

| 组件 | 默认从哪里读 | 默认读取 key |
| --- | --- | --- |
| `web-koa` | `ctx.headers` | `traceparent` / `tracestate` / `baggage` |
| `web-express` | `req.headers` | `traceparent` / `tracestate` / `baggage` |
| `ws` | `request.headers` | `traceparent` / `tracestate` / `baggage` |
| `socketio` | `socket.handshake.headers` | `traceparent` / `tracestate` / `baggage` |
| `grpc` provider | `call.metadata.getMap()` | `traceparent` / `tracestate` / `baggage`（metadata key） |
| `kafka` consumer | `payload.message.headers` | `traceparent` / `tracestate` / `baggage`（message headers key） |
| `mqtt` consumer | `packet.properties.userProperties` | `traceparent` / `tracestate` / `baggage`（userProperties key） |
| `rabbitmq` consumer | `message.properties.headers` | `traceparent` / `tracestate` / `baggage`（AMQP headers key） |
| `bull`/`bullmq` consumer | `job.data.__midwayTraceCarrier` | `traceparent` / `tracestate` / `baggage`（内部 carrier key） |
| `cron`/`commander`/`faas`/`one-shot`/`piscina`/`mcp` | 组件内部默认 carrier | 通常无上游协议头；有 carrier 时按 `traceparent` / `tracestate` / `baggage` 读取 |

再看出口（injector，写出）：

| 组件 | 默认写到哪里 |
| --- | --- |
| `web-koa` | `ctx.response` |
| `web-express` | `res` |
| `ws` | 事件 payload 对象 |
| `socketio` | 事件 payload 对象 |
| `grpc` consumer | `clientOptions.metadata`（默认 `new Metadata()`） |
| `kafka` producer | `message.headers` |
| `mqtt` producer | `publishOptions.properties.userProperties` |
| `rabbitmq` producer | `options.headers` |
| `bull`/`bullmq` producer | `jobData.__midwayTraceCarrier` |
| `axios` | `requestConfig.headers` |
| `redis`/`cache-manager`/`oss`/`cos`/`etcd`/`consul`/`tablestore` | 默认新建 `{}`（可用 `injector` 覆盖） |

按组件配置示例（可直接改）：

```typescript
// src/config/config.default.ts
export default {
  // HTTP 入口/出口
  koa: {
    tracing: {
      extractor: ({ request }) => (request as any)?.headers || {},
      injector: ({ response }) => response as any,
    },
  },

  // gRPC provider 入口
  grpc: {
    tracing: {
      extractor: ({ request }) =>
        (request as any)?.metadata?.getMap?.() || {},
    },
  },

  // Kafka consumer 入口 + producer 出口
  kafka: {
    tracing: {
      extractor: ({ request }) => (request as any)?.message?.headers || {},
      injector: ({ request }) => (request as any)?.headers || {},
    },
  },

  // WS 入口/出口（示例）
  ws: {
    tracing: {
      extractor: ({ request }) => (request as any)?.headers || {},
      injector: ({ request }) => (request as any)?.headers || {},
    },
  },
};
```

一个常见业务例子（HTTP）：

- 你希望入口优先从自定义 header `x-traceparent` 读取。
- 你希望出口统一写到 `x-traceparent`。

```typescript
export default {
  koa: {
    tracing: {
      extractor: ({ request }) => {
        const headers = (request as any)?.headers || {};
        if (headers['x-traceparent'] && !headers.traceparent) {
          headers.traceparent = headers['x-traceparent'];
        }
        return headers;
      },
      injector: ({ response }) => response as any,
    },
  },
};
```

### 自定义 propagator（可选）

可以。  
Midway 会使用 OpenTelemetry 的全局 propagator。你可以在 `bootstrap.js` 里改成自己的实现（例如 B3）。

示例（B3）：

先安装依赖：

```bash
$ npm install --save @opentelemetry/propagator-b3
```

```json
{
  "dependencies": {
    "@opentelemetry/propagator-b3": "latest"
  }
}
```

然后在 Midway 启动前设置全局 propagator：

```javascript
const { Bootstrap } = require('@midwayjs/bootstrap');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { propagation } = require('@opentelemetry/api');
const { B3Propagator } = require('@opentelemetry/propagator-b3');

const provider = new NodeTracerProvider();
provider.register();

// 设置全局 propagator（示例：B3）
propagation.setGlobalPropagator(new B3Propagator());

Bootstrap.configure().run();
```

注意：

- 这会影响 `extractor/injector` 默认读写的 key（不再是 `traceparent`/`tracestate`）。
- 建议全链路统一一种 propagator，避免上下游格式不一致。

### 自定义 traceId

方式 1（推荐）：上游传入标准 `traceparent`，Midway 自动继承 TraceId。

```http
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
```

方式 2（高级）：在 OpenTelemetry SDK 层配置自定义 `IdGenerator`（不属于 Midway 配置项）。

`bootstrap.js` 示例：

```javascript
const crypto = require('crypto');
const { Bootstrap } = require('@midwayjs/bootstrap');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const {
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} = require('@opentelemetry/sdk-trace-base');

class CustomIdGenerator {
  // 32位十六进制（16 bytes）
  generateTraceId() {
    return crypto.randomBytes(16).toString('hex');
  }

  // 16位十六进制（8 bytes）
  generateSpanId() {
    return crypto.randomBytes(8).toString('hex');
  }
}

const provider = new NodeTracerProvider({
  idGenerator: new CustomIdGenerator(),
});

provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register();

Bootstrap.configure().run();
```

注意：

- 这只影响“本服务新建”的 trace/span ID。
- 如果上游已传入 `traceparent`，会优先沿用上游 traceId。

## 从 @midwayjs/otel 迁移

- 包迁移：`@midwayjs/otel` -> `@midwayjs/core`
- 配置迁移：删除 `imports: [otel]`
- 使用方式：`ctx.traceId` 保持不变
- 行为兼容：`@Trace` 与 `MidwayTraceService` 能力继续可用

迁移清单：

1. 删除依赖：`npm uninstall @midwayjs/otel`
2. 删除配置：移除 `Configuration.imports` 中的 `otel`
3. 更新导入路径
   - `import { Trace } from '@midwayjs/otel'` -> `import { Trace } from '@midwayjs/core'`
   - `import { TraceService } from '@midwayjs/otel'` -> `import { MidwayTraceService } from '@midwayjs/core'`

## 相关阅读

- [OpenTelemetry 官方文档](https://opentelemetry.io/docs/)
