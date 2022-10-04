# midwayjs open-telemetry module

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/midwayjs/midway/pulls)

this is a sub package for midway.


## Install

```bash
$ npm install --save @opentelemetry/api
$ npm install --save @opentelemetry/sdk-node
$ npm install --save @opentelemetry/auto-instrumentations-node
```

Install component if you want decorator support.

```bash
$ npm i @midwayjs/otel@3 --save
```

## Enable open-telemetry

open-telemetry must be loaded at the first of user code.

you can add at `bootstrap.js`.

```typescript
const process = require('process');
const opentelemetry = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { Bootstrap } = require('@midwayjs/bootstrap');

// configure the SDK to export telemetry data to the console
// enable all auto-instrumentations from the meta package
const traceExporter = new ConsoleSpanExporter();
const sdk = new opentelemetry.NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'my-service',
  }),
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()]
});

// initialize the SDK and register with the OpenTelemetry API
// this enables the API to record telemetry
sdk.start()
  .then(() => {
    return Bootstrap
      .configure(/**/)
      .run();
  });

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
```

You can find more information at [opentelemetry-js](https://github.com/open-telemetry/opentelemetry-js)


## Decorator Support

Enable component first.

```typescript
import { Configuration } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as otel from '@midwayjs/otel';

@Configuration({
  imports: [
    koa,
    otel
  ]
})
export class MainConfiguration {
}
```

Otel component add a @Trace decorator for method.

```typescript
export class UserService {

  @Trace('user.get')
  async getUser() {
    // ...
  }
}
```

it will create a new span in current trace.


## License

[MIT]((http://github.com/midwayjs/midway/blob/master/LICENSE))
