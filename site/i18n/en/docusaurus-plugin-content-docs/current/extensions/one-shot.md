# One-time Execution

`@midwayjs/one-shot` is a one-shot script framework that only provides a Framework. It is suitable for running tasks once with IoC-managed dependencies.

Related information:

| Description                |      |
| -------------------------- | ---- |
| Available for standard app | ❌    |
| Available for Serverless   | ❌    |
| Available for integrated   | ❌    |
| Includes standalone core   | ✅    |
| Includes standalone logger | ✅    |

## Install

Install the one-shot component dependency in an existing project.

```bash
$ npm i @midwayjs/one-shot@4  --save
```

Or add the following dependency to `package.json`, then reinstall.

```json
{
  "dependencies": {
    "@midwayjs/one-shot": "^4.0.0"
  }
}
```

## Enable the component

Import the component in the entry configuration.

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as oneShot from '@midwayjs/one-shot';

@Configuration({
  imports: [oneShot],
})
export class MainConfiguration {}
```

## Run in lifecycle

No extra Runner is required. It's recommended to execute one-shot logic in `onServerReady`.

```typescript
// src/configuration.ts
import { Configuration, Inject } from '@midwayjs/core';
import * as oneShot from '@midwayjs/one-shot';
import { ScriptService } from './service/script';

@Configuration({
  imports: [oneShot],
})
export class MainConfiguration {
  @Inject()
  scriptService: ScriptService;

  async onServerReady() {
    await this.scriptService.runOnce();
  }
}
```

## When request scope is needed

If your script needs request-scope services, use the framework `runScript` API with a fixed runner class. The framework will create a context for this execution and run the middleware/filter chain.

```typescript
// src/script/syncUser.ts
import { Provide } from '@midwayjs/core';
import { OneShotRunner, Context } from '@midwayjs/one-shot';

@Provide()
export class SyncUserScript implements OneShotRunner<{ id: number }, void> {
  async run(payload?: { id: number }, ctx?: Context) {
    // use payload / ctx
    void payload;
    void ctx;
  }
}
```

```typescript
// src/configuration.ts
import { Configuration, Inject } from '@midwayjs/core';
import * as oneShot from '@midwayjs/one-shot';
import { Framework } from '@midwayjs/one-shot';
import { SyncUserScript } from './script/syncUser';

@Configuration({
  imports: [oneShot],
})
export class MainConfiguration {
  @Inject()
  framework: Framework;

  async onServerReady() {
    await this.framework.runScript(SyncUserScript, { id: 42 });
  }
}
```

## Logger

By default, the component registers a logger named `oneShotLogger`, which writes to `midway-one-shot.log`.

You can inject and use it in your script service via `@Logger('oneShotLogger')`, for example:

```typescript
import { Logger, ILogger } from '@midwayjs/core';

export class ScriptService {
  @Logger('oneShotLogger')
  logger: ILogger;

  async runOnce() {
    this.logger.info('run one-shot task');
  }
}
```

If you want to customize the log file name or level, override `midwayLogger.clients.oneShotLogger` in your application config:

```typescript
// src/config/config.default.ts
export default {
  midwayLogger: {
    clients: {
      oneShotLogger: {
        fileLogName: 'my-one-shot.log',
        level: 'info',
      },
    },
  },
};
```
