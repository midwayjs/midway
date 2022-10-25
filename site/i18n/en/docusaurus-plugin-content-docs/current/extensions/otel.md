# Tracer

Midway adopts the latest [open-telemetry](https://opentelemetry.io/) scheme in the community. Its predecessor is a well-known OpenTracing and OpenCensus specification. At this stage, Midway is also an incubation project of CNCF. Many well-known large companies in the community such as Amazon,Dynatrace,Microsoft,Google,Datadog,Splunk, etc. have used it.

[Open-telemetry](https://opentelemetry.io/) provides a general Node.js access solution, which receives, processes, and exports data in a vendor-independent manner, and supports sending observable data to one or more open source or commercial collection terminals (such as Alibaba Cloud SLS,Jaeger,Prometheus,Fluent Bit, etc.).

Midway provides a Node.js scheme to access [open-telemetry](https://opentelemetry.io/) and some simple API.

:::info

The Tracing part of [open-telemetry](https://opentelemetry.io/) is currently Release 1.0.0 for Node.js SDK, which can be used in production. The Metrics part has not been officially released, and we are still following up (encoding).

:::



## Instructions for Use

[Open-telemetry](https://opentelemetry.io/) the Async_Hooks stable API implementation based on Node.js. after our tests, the performance impact of the latest Node.js v14/v16 has been very small and can be used in production. although it can be used in the case of v12, there is still a big loss in performance. please use it in the version of Node.js >= v14 as much as possible.



## Installation base dependency

```bash
# Node.js api abstraction
$ npm install --save @opentelemetry/api

Api implementation of# Node.js
$ npm install --save @opentelemetry/sdk-node

# Common Node.js Module Buried Point Implementation
$ npm install --save @opentelemetry/auto-instrumentations-node

# jaeger output
$ npm install --save @opentelemetry/exporter-jaeger
```

The above packages are all official packages of [open-telemetry](https://opentelemetry.io/).



## Enable open-telemetry

Please add the [open-telemetry](https://opentelemetry.io/) module to the beginning of the code as much as possible (earlier than the framework), so we have different ways to add it in different scenarios.



### Use bootstrap deployment

If you use `bootstrap.js` deployment, you can add it to the top of the `bootstrap.js`. The sample code is as follows.

```typescript
const process = require('process');
const opentelemetry = require('@opentelemetry/sdk-node');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions')
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger')

// Midway startup file
const { Bootstrap } = require('@midwayjs/bootstrap');

// https://www.npmjs.com/package/@opentelemetry/exporter-jaeger
const tracerAgentHost = process.env['TRACER_AGENT_HOST'] || '127.0.0.1'
const jaegerExporter = new JaegerExporter({
  host: tracerAgentHost
});

// Initialize an open-telemetry SDK
const sdk = new opentelemetry.NodeSDK({
  // Set the tracking service name
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'my-app',
  }),
  // Configure the current export method. For example, one output to the console is configured here, or other Exporter can be configured, such as Jaeger.
  traceExporter: new ConsoleSpanExporter()
  // configure the current export as jaeger
  // traceExporter: jaegerExporter

  // Some monitoring modules provided by default are configured here, such as http module, etc.
  // If the initialization time is very long, you can log off this line and configure the required instrumentation entries separately.
  instrumentations: [getNodeAutoInstrumentations()]
});

// Initialize the SDK and start the Midway framework after successful startup.
sdk.start()
  .then(() => {
    return Bootstrap
      .configure(/**/)
      .run();
  });

// When the process is closed, data collection is closed at the same time
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
```



### Use egg-scripts deployment

Egg-scripts Since no portal deployment is provided, additional files must be loaded in the form of `-require`.

Add a `tel.js` file to the root directory. The content is as follows.

```javascript
const process = require('process');
const opentelemetry = require('@opentelemetry/sdk-node');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

// Initialize an open-telemetry SDK
const sdk = new opentelemetry.NodeSDK({
  // Configure the current export method. For example, one output to the console is configured here, or other Exporter can be configured, such as Jaeger.
  traceExporter: new ConsoleSpanExporter()
  // Some monitoring modules provided by default are configured here, such as http module, etc.
  instrumentations: [getNodeAutoInstrumentations()]
});

// Initialize SDK
sdk.start()
  .then(() => console.log('Tracing initialized'))
  .catch((error) => console.log('Error initializing tracing', error));

// When the process is closed, data collection is closed at the same time
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
```

Modify the startup command in the `package.json`.

```json
{
  // ...
  "scripts": {
    "start": "egg-scripts start --daemon --title=**** --framework=@midwayjs/web --require=./otel.js ",
  },
}
```

### Development and debugging portal

`midway-bin` uses the `-- entryFile` parameter to specify the entry file

For example, the `package.json` file
```json
{
  "scripts": {
    "start": "cross-env NODE_ENV=local midway-bin dev --ts --entryFile=bootstrap.js"
  }
}
```

## Common concepts

[Open-telemetry](https://opentelemetry.io/) provides some abstract packaging, packaging the whole process of monitoring into several steps, each step can be customized configuration, and there are also some terms that users do not understand. Let's explain them below.

Please refer to the [Concepts](https://opentelemetry.io/docs/concepts/) for complete English concepts.



### API

A set of API abstractions used to generate and associate data types and operations of Tracing, Metrics, and Logs record data. The specific expression is the package `@opentelemetry/api`, which contains some interfaces and empty implementations.

### SDK

The language-specific implementation of the API, such as the implementation of Node.js (`@opentelemetry/sdk-node` ), and the implementation of the collection SDK of other monitoring platforms.

### Instrumentations

[Open-telemetry](https://opentelemetry.io/) provides shim codes of some common libraries. It uses hooks or monkey-patching methods to intercept methods, automatically saves link data when specific methods are called, and supports http,gRPC , redis,mysql and other modules. Users can use them directly by configuring them.

For example, the `@opentelemetry/auto-instrumentations-node` introduced in the above example is a instrumentations collection package that has already encapsulated common libraries by default, including most of the libraries that will be used. For specific dependencies, please refer to [Github](https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/metapackages/auto-instrumentations-node/package.json).

### Exporter

Sends the received link data to a specific implementation, such as Jaeger,zipkin, etc.



## Example



### Add tripartite instrumentation

When the SDK is initialized, add it to the `instrumentations` array.

```typescript
const { RedisInstrumentation } = require('@opentelemetry/instrumentation-redis');
// ...

// Initialize an open-telemetry SDK
const sdk = new opentelemetry.NodeSDK({
  // ...

  // This is only an added example. If auto-instrumentations-node is used, the following instrumentation are already included
  instrumentations: [
    new RedisInstrumentation()
  ]
});
```



### Add Jaeger Exporter

Here, Jaeger Exporter is taken as an example, and other Exporter are similar.

Add dependencies first.

```bash
$ npm install --save @opentelemetry/exporter-jaeger @opentelemetry/propagator-jaeger
```

Configure in the SDK.

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

// Initialize an open-telemetry SDK
const sdk = new opentelemetry.NodeSDK({
  traceExporter: exporter
  textMapPropagator: new JaegerPropagator()
  // ...
});
```

For specific parameters, please refer:

- [opentelemetry-exporter-jaeger](https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-exporter-jaeger/README.md)
- [opentelemetry-propagator-jaeger](https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-propagator-jaeger/README.md)



### Alibaba Cloud ARMS

Alibaba Cloud Application Real-Time Monitoring Service ([ARMS](https://www.aliyun.com/product/arms/)) already supports indicators in open-telemetry format, and provides an sdk for access.

First, `opentelemetry-arms` is installed.

```bash
# arms sdk
$ npm install --save opentelemetry-arms
```

Then, add the environment variable and `-R` parameters at startup.

```bash
$SERVICE_NAME=nodejs-opentelemetry-express AUTHENTICATION=**** ENDPOINT=grpc://**** node -r opentelemetry-arms bootstrap.js
```

:::tip

- 1. There is no need to add code to `bootstrap.js` for access in this way.
- 2. The default sdk only provides link support for http/express/koa modules and does not include other instrumentations. If necessary, you can copy the source code to `bootstrap.js` for customization.

:::



## Decorator support

Midway adds a decorator to add link nodes to the needs of the user side.

Install dependencies first.

```bash
$ npm i @midwayjs/otel@3 --save
```

Enable the `tel` component.

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

The Otel component provides an @Trace decorator that can be added to the method.

```typescript
export class UserService {

  @Trace('user.get')
  async getUser() {
    // ...
  }
}
```

The decorator needs to pass in a node name, so that the link will automatically add a link node of the method and record the execution time. The method execution succeeded or failed.



