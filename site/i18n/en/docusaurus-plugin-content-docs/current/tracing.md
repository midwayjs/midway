# Tracing

Starting from Midway v4, framework-level tracing is built into `@midwayjs/core`. You no longer need to install or enable `@midwayjs/otel`.

## Notes

- Midway creates and propagates spans automatically at entry and exit points.
- `tracing.enable` is the global switch (only controls whether tracing is enabled).
- Protocol-specific behavior is configured in each component (for example `koa.tracing`, `grpc.tracing`, `kafka.tracing`). `core` itself does not distinguish protocols.
- Each component can be configured with `<component>.tracing.enable`, `meta`, `extractor`, and `injector`.
- To see traces in Jaeger/Zipkin/OTLP backends, you still need to initialize the OpenTelemetry SDK and configure an exporter.

## OpenTelemetry Basics

- Trace: one end-to-end request flow that contains multiple spans.
- Span: one operation in the flow, with timing/status/attributes.
- Context Propagation: passing upstream trace context to downstream calls (HTTP headers, MQTT properties, gRPC metadata, etc.).
- Attributes: key/value fields on spans for filtering and searching.
- TraceId: global ID for one trace.

## Quick Start

### 1) Enable framework tracing (enabled by default)

```typescript
// src/config/config.default.ts
export default {
  tracing: {
    enable: true,
    onError: 'ignore', // or 'throw'
    logOnError: false,
  },
};
```

### 2) Component-level switches

```typescript
// src/config/config.default.ts
export default {
  tracing: {
    enable: true, // global switch
  },
  koa: {
    tracing: {
      enable: true,
    },
  },
  kafka: {
    tracing: {
      enable: false, // disable kafka tracing only
    },
  },
};
```

Rules:

- `tracing.enable=false`: disables tracing globally (no spans from any component).
- `tracing.enable=true`: each component's own `tracing.enable` decides whether that component emits spans.

### 3) Export to console (minimal example)

Install minimal dependencies:

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

`bootstrap.js`:

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

After startup, spans will be printed only when requests/messages are actually handled.

Example output:

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

Check these fields first:

- `traceId`: present and 32-char hex string.
- `name`: matches your request/task.
- `attributes.midway.protocol`: shows protocol like `http` / `grpc` / `kafka`.

If you see no spans:

- Ensure `provider.register()` runs before `Bootstrap.configure().run()`.
- Ensure traffic really hits a traced entry point.

:::tip

In `dev` mode, spans are not visible in the master process console (`dev` does not use this `bootstrap.js` init path).

:::

### 4) Connect to an observability backend (optional)

Common exporters:

- OTLP/HTTP: `@opentelemetry/exporter-trace-otlp-http`
- OTLP/gRPC: `@opentelemetry/exporter-trace-otlp-grpc`
- Jaeger: `@opentelemetry/exporter-jaeger`
- Zipkin: `@opentelemetry/exporter-zipkin`

Jaeger example:

1. Install Jaeger exporter

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

2. Update `bootstrap.js`

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

3. Verify

- Start app and trigger requests.
- Open Jaeger UI (usually `http://127.0.0.1:16686`).
- Search by service and confirm spans are present.

## Framework Features

### `ctx.traceId`

`@midwayjs/core` provides `ctx.traceId`.

All Midway context-based frameworks can read it (web/koa/express/ws/grpc/faas, etc.).

```typescript
ctx.traceId => '4bf92f3577b34da6a3ce929d0e0e4736'
```

### `@Trace` decorator

```typescript
import { Trace } from '@midwayjs/core';

export class UserService {
  @Trace('user.get')
  async getUser() {
    // ...
  }
}
```

### `MidwayTraceService`

```typescript
import { Inject, MidwayTraceService } from '@midwayjs/core';

export class UserService {
  @Inject()
  traceService: MidwayTraceService;
}
```

## Advanced

### Custom `meta` attributes

You can attach business fields (user ID, tenant ID, queue name, etc.) to spans.

Three common patterns:

1. Static object

```typescript
meta: {
  'biz.app': 'user-center',
}
```

2. Function (dynamic)

```typescript
meta: ({ protocol, direction }) => ({
  'biz.protocol': protocol,
  'biz.direction': direction,
})
```

3. Directional object (`common` + `entry` + `exit`)

```typescript
meta: {
  common: { 'biz.app': 'user-center' },
  entry: { 'biz.side': 'in' },
  exit: { 'biz.side': 'out' },
}
```

Common callback args:

- `direction`: `entry` or `exit`
- `protocol`: protocol name (`http`, `grpc`, `kafka`, `redis`, ...)
- `ctx`: current context
- `request` / `response`: current request/response objects
- `custom`: component-specific info (`queueName`, `eventName`, `clientName`, ...)

Only string/number/boolean values are kept in final span attributes.

Component-level `meta` example:

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

### Custom entry/exit context location (`extractor` / `injector`)

These are for context propagation:

- `extractor`: entry-side read. Called before entry span creation.
- `injector`: exit-side write. Called before downstream request/message is sent.

When to configure:

- Default behavior is enough: do nothing.
- Your transport/header structure is custom.
- Different protocols require different fields.

Common callback args:

- `request`
- `response`
- `ctx`
- `carrier`
- `custom`

Return value rules:

- Return a writable key/value carrier (plain object, headers object, metadata container, etc.).
- If `undefined` is returned, component falls back to its default carrier.

Default mapping (current implementation)

Entry first (`extractor`, read):

By default Midway uses OpenTelemetry global propagator. Without custom setup, this is usually W3C:

- `traceparent`
- `tracestate`
- `baggage`

In practice this means reading same-key fields from each protocol carrier.

| Component | Read from | Default keys |
| --- | --- | --- |
| `web-koa` | `ctx.headers` | `traceparent` / `tracestate` / `baggage` |
| `web-express` | `req.headers` | `traceparent` / `tracestate` / `baggage` |
| `ws` | `request.headers` | `traceparent` / `tracestate` / `baggage` |
| `socketio` | `socket.handshake.headers` | `traceparent` / `tracestate` / `baggage` |
| `grpc` provider | `call.metadata.getMap()` | `traceparent` / `tracestate` / `baggage` (metadata keys) |
| `kafka` consumer | `payload.message.headers` | `traceparent` / `tracestate` / `baggage` (message header keys) |
| `mqtt` consumer | `packet.properties.userProperties` | `traceparent` / `tracestate` / `baggage` (userProperties keys) |
| `rabbitmq` consumer | `message.properties.headers` | `traceparent` / `tracestate` / `baggage` (AMQP header keys) |
| `bull`/`bullmq` consumer | `job.data.__midwayTraceCarrier` | `traceparent` / `tracestate` / `baggage` (internal carrier keys) |
| `cron`/`commander`/`faas`/`one-shot`/`piscina`/`mcp` | internal default carrier | usually no upstream protocol header; if carrier exists, reads `traceparent` / `tracestate` / `baggage` |

Then exit (`injector`, write):

| Component | Write to |
| --- | --- |
| `web-koa` | `ctx.response` |
| `web-express` | `res` |
| `ws` | event payload object |
| `socketio` | event payload object |
| `grpc` consumer | `clientOptions.metadata` (default `new Metadata()`) |
| `kafka` producer | `message.headers` |
| `mqtt` producer | `publishOptions.properties.userProperties` |
| `rabbitmq` producer | `options.headers` |
| `bull`/`bullmq` producer | `jobData.__midwayTraceCarrier` |
| `axios` | `requestConfig.headers` |
| `redis`/`cache-manager`/`oss`/`cos`/`etcd`/`consul`/`tablestore` | default `{}` (override with `injector`) |

Component config example:

```typescript
// src/config/config.default.ts
export default {
  koa: {
    tracing: {
      extractor: ({ request }) => (request as any)?.headers || {},
      injector: ({ response }) => response as any,
    },
  },

  grpc: {
    tracing: {
      extractor: ({ request }) =>
        (request as any)?.metadata?.getMap?.() || {},
    },
  },

  kafka: {
    tracing: {
      extractor: ({ request }) => (request as any)?.message?.headers || {},
      injector: ({ request }) => (request as any)?.headers || {},
    },
  },

  ws: {
    tracing: {
      extractor: ({ request }) => (request as any)?.headers || {},
      injector: ({ request }) => (request as any)?.headers || {},
    },
  },
};
```

Common HTTP customization example:

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

### Custom propagator (optional)

Yes. Midway uses OpenTelemetry global propagator. You can set your own propagator in `bootstrap.js` (for example B3).

Install:

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

Set before Midway startup:

```javascript
const { Bootstrap } = require('@midwayjs/bootstrap');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { propagation } = require('@opentelemetry/api');
const { B3Propagator } = require('@opentelemetry/propagator-b3');

const provider = new NodeTracerProvider();
provider.register();

propagation.setGlobalPropagator(new B3Propagator());

Bootstrap.configure().run();
```

Notes:

- This changes default keys used by `extractor`/`injector` (not `traceparent`/`tracestate` anymore).
- Keep one propagator format across upstream/downstream services.

### Custom traceId

Option 1 (recommended): pass standard `traceparent` from upstream; Midway will inherit TraceId.

```http
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
```

Option 2 (advanced): configure OpenTelemetry SDK `IdGenerator` (not a Midway config item).

`bootstrap.js` example:

```javascript
const crypto = require('crypto');
const { Bootstrap } = require('@midwayjs/bootstrap');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const {
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} = require('@opentelemetry/sdk-trace-base');

class CustomIdGenerator {
  generateTraceId() {
    return crypto.randomBytes(16).toString('hex');
  }

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

Notes:

- This only affects IDs created in this service.
- If upstream already sends `traceparent`, upstream traceId is used.

## Migration from `@midwayjs/otel`

- Package: `@midwayjs/otel` -> `@midwayjs/core`
- Config: remove `imports: [otel]`
- Usage: `ctx.traceId` stays the same
- Compatibility: `@Trace` and `MidwayTraceService` continue to work

Migration checklist:

1. Remove dependency: `npm uninstall @midwayjs/otel`
2. Remove config: delete `otel` from `Configuration.imports`
3. Update imports
   - `import { Trace } from '@midwayjs/otel'` -> `import { Trace } from '@midwayjs/core'`
   - `import { TraceService } from '@midwayjs/otel'` -> `import { MidwayTraceService } from '@midwayjs/core'`

## Further Reading

- [OpenTelemetry docs](https://opentelemetry.io/docs/)
