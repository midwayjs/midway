# Express

This chapter mainly introduces how to use Express as the upper-level framework in Midway and use its own capabilities.

| Description |      |
| -------------- | ---- |
| Contains independent main framework | ✅ |
| Contains independent logs | ✅ |



## Installation dependency

```bash
$ npm i @midwayjs/express@3 --save
$ npm i @types/body-parser @types/express @types/express-session --save-dev
```

Or reinstall the following dependencies in `package.json`.

```json
{
  "dependencies": {
    "@midwayjs/express": "^3.0.0",
    // ...
  },
  "devDependencies": {
    "@types/body-parser": "^1.19.2",
    "@types/express": "^4.17.13",
    "@types/express-session": "^1.17.4",
    // ...
  }
}
```

Examples can also be created directly using scaffolding.

```bash
# npm v6
$ npm init midway --type=express-v3 my_project

# npm v7
$ npm init midway -- --type=express-v3 my_project
```


For Express,Midway provides `@midwayjs/express` package for adaptation, in which Midway provides unique dependency injection, section and other capabilities.

:::info
The Express version we are using is `v4`.
:::


## Directory structure
```
.
├── src
│   ├── controller								 				# controller cdoe
│   ├── service									 					# service code
|   └── configuration.ts									# Entry, Lifecycle Configuration and Component Management
├── test
├── package.json
└── tsconfig.json
```



## Open the component

```typescript
import { Configuration, App } from '@midwayjs/core';
import * as express from '@midwayjs/express';
import { join } from 'path';

@Configuration({
  imports: [express],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  @App()
  app: express.Application;

  async onReady() {}
}
```




## Controller


The writing of the entire request controller is similar to that of Midway adapts to other frameworks. In order to be consistent with the frame writing of other scenes, Midway maps the `req` of the Express to a `ctx` object when requesting.
```typescript
import { Inject, Controller, Get, Provide, Query } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/express';

@Controller('/')
export class HomeController {

  @Inject()
  ctx: Context;

  @Get('/')
  async home(@Query() id) {
    console.log(id);						// req.query.id === id
    return 'hello world'; 			// Simple return, equivalent to res.send('hello world');
  }
}
```
You can also add `req` and `res`.
```typescript
import { Inject, Controller, Get, Provide, Query } from '@midwayjs/core';
import { Context, Response, NextFunction } from '@midwayjs/express';

@Controller('/')
export class HomeController {

  @Inject()
  ctx: Context; // is req

  @Inject()
  req: Context;

  @Inject()
  res: Response;

  @Get('/')
  async home(@Query() id) {
    // this.req.query.id === id
  }
}
```



## Web middleware


Express middleware is written in a special way, and its parameters are different.


```typescript
import { Middleware } from '@midwayjs/core';
import { Context, Response, NextFunction } from '@midwayjs/express';

@Middleware()
export class ReportMiddleware implements IMiddleware<Context, Response, NextFunction> {

  resolve() {
    return async (
      req: Context,
      res: Response,
      next: NextFunction
    ) => {
      console.log('Request...');
      next();
    };
  }

}
```

Note that we have exported a `ReportMiddleware` class here. In order to facilitate the docking of asynchronous processes, the `resolve` return can be an async function.

The next method in the Express is used to call the next middleware, which means that the Express middleware is not an onion model, but a one-way call.




### Routing middleware


We can apply the middleware written above to a single Controller or to a single route.


```typescript
import { Controller, Get, Provide } from '@midwayjs/core';

@Controller('/', { middleware: [ ReportMiddleware ]}) // controller-level middleware
export class HomeController {

  @Get('/', { middleware: [ ReportMiddleware ]}) // routing-level middleware
  async home() {
    return 'hello world'
  }
}
```


### Global middleware


Directly use the `app.generateMiddleware` method provided by Midway to load global middleware at the entrance.
```typescript
// src/configuration.ts
import { Configuration, ILifeCycle } from '@midwayjs/core';
import * as express from '@midwayjs/express';
import { ReportMiddleware } from './middleware/report.middleware.ts'

@Configuration({
  imports: [express],
})
export class MainConfiguration implements ILifeCycle {

  @App()
  app: express.Application;

  async onReady() {
    this.app.useMiddleware(ReportMiddleware);
  }
}
```


In addition to loading middleware in the form of Class, it also supports loading traditional Express middleware.
```typescript
// src/configuration.ts
import { Configuration, App, ILifeCycle } from '@midwayjs/core';
import * as express from '@midwayjs/express';
import { join } from 'path';

@Configuration({
  imports: [express]
})
export class MainConfiguration implements ILifeCycle {

  @App()
  app: express.Application;

  async onReady() {
    this.app.useMiddleware((req, res, next) => {
    	// xxx
    });
  }
}
```
You can call methods on all Express by injecting `app` objects.



## Return to unified processing

Since the Express middleware is a one-way call and cannot be executed on return, we have designed an additional filter decorated by `@Match` to handle the behavior of the return value.

For example, we can define filters returned globally.

```typescript
// src/filter/globalMatch.filter.ts
import { Match } from '@midwayjs/core';
import { Context, Response } from '@midwayjs/express';

@Match()
export class GlobalMatchFilter {
  match(value, req, res) {
    // ...
    return {
      status: 200
      data: {
        value
      },
    };
  }
}
```

You can also match a specific route for return.

```typescript
// src/filter/api.filter.ts
import { Match } from '@midwayjs/core';
import { Context, Response } from '@midwayjs/express';

@Match((ctx: Context, res: Response) => {
  return ctx.path === '/api';
})
export class APIMatchFilter {
  match(value, req: Context, res: Response) {
    // ...
    return {
      data: {
        message:
        data: value
      },
    };
  }
}
```

It needs to be applied to app.

```typescript
import { Configuration, App } from '@midwayjs/core';
import * as express from '@midwayjs/express';
import { join } from 'path';
import { APIMatchFilter } from './filter/api.filter';
import { GlobalMatchFilter } from 'filter/globalMatch.filter';

@Configuration({
  imports: [express],
  importConfigs: [join(__dirname, './config')]
})
export class MainConfiguration {
  @App()
  app: express.Application;

  async onReady() {
    // ...
    this.app.useFilter([APIMatchFilter, GlobalMatchFilter]);
  }
}
```

Note that such filters are matched and executed in the order in which they are added.



## Error handling

Same as ordinary items, using error filters, but the parameters are slightly different.

```typescript
import { Catch } from '@midwayjs/core';
import { Context, Response } from '@midwayjs/express';

@Catch()
export class GlobalError {
  catch(err: Error, req: Context, res: Response) {
    if (err) {
      return {
        status: err.status ?? 500,
        message: err.message
      }
    }
  }
}
```

It needs to be applied to app.

```typescript
import { Configuration, App } from '@midwayjs/core';
import * as express from '@midwayjs/express';
import { join } from 'path';
import { GlobalError } from './filter/global.filter';

@Configuration({
  imports: [express]
  importConfigs: [join(__dirname, './config')]
})
export class MainConfiguration {
  @App()
  app: express.Application;

  async onReady() {
    this.app.useMiddleware((req, res, next) => {
      next();
    });

    this.app.useFilter([GlobalError]);
  }
}
```

Note that both `@Match` and `@Catch` are filters that are automatically executed internally. .



## Cookie

`@midwayjs/express` comes with the `cookie parser` function and uses the `cookie-parser` module.

Use `keys` as the key for cookies.

```typescript
// src/config/config.default
export default {
  keys: ['key1', 'key2']
}
```

Get Cookie.

```typescript
const cookieValue = req.cookies['cookie-key'];
```

Set Cookie.

```typescript
res.cookie (
  'cookie-key',
  'cookie-value',
  cookieOptions
);
```



## Session

`@midwayjs/express` has built-in Session components, providing us with `ctx.session` to access or modify the current user Session.

By default, `cookie-session` is used. The default configuration is as follows.

```typescript
// src/config/config.default
export default {
  session: {
    name: 'MW_SESS',
    resave: true
    saveUninitialized: true
    cookie: {
      maxAge: 24*3600 * 1000, // ms
      httpOnly: true
      // sameSite: null
    },
  }
}
```

We can set the session through a simple API.

```typescript
@Controller('/')
export class HomeController {

  @Inject()
  req;

  @Get('/')
  async get() {
    // set all
    this.req.session = req.query;

    // set value
    this.req.session.key = 'abc';

    // get
    const key = this.req.session.key;

    // remove
    this.req.session = null;

    // set max age
    this.req.session.maxAge = Number(req.query.maxAge);

    // ...
  }
}

```



## BodyParser

`@midwayjs/express` has its own `bodyParser` function. By default, it parses `Post` requests and automatically identifies `json`, `text`, and `urlencoded` types.

The default size is limited to `1mb`. You can set the size of each item separately.

```typescript
// src/config/config.default
export default {
  // ...
  bodyParser: {
    json: {
      enable: true
      limit: '1mb',
      strict: true
    },
    raw: {
      enable: false
      limit: '1mb',
    },
    text: {
      enable: true
      limit: '1mb',
    },
    urlencoded: {
      enable: true
      extended: false
      limit: '1mb',
      parameterLimit: 1000
    },
  },
}
```



## Configuration

### Default configuration

The configuration sample of `@midwayjs/express` is as follows:

```typescript
// src/config/config.default
export default {
  // ...
  express: {
    port: 7001
  },
}
```

All attributes are described as follows:

| Property | Type | Description |
| ------------ | ----------------------------------------- | ------------------------------------------------------- |
| port | number | Optional, port to start |
| globalPrefix | string | optional. the global http prefix |
| keys | string [] | Optional, Cookies signature, if the upper layer does not write keys, you can also set it here |
| hostname | string | Optional. The hostname to listen to. Default 127.1 |
| key | string \| Buffer \| Array<Buffer\|Object> | Optional, Https key, server private key |
| cert | string \| Buffer \| Array<Buffer\|Object> | Optional, Https cert, server certificate |
| ca | string \| Buffer \| Array<Buffer\|Object> | Optional, Https ca |
| http2 | boolean | Optional, supported by http2, default false |



### Modify port

By default, we provide the `7001` default port parameter in `config.default`. by modifying it, we can modify the default port of Express http service.

For example, we changed it to `6001`:

```typescript
// src/config/config.default
export default {
  // ...
  express: {
    port: 6001
  },
}
```

By default, our port configuration is `null` because the single-test environment requires supertest to start the port.

```typescript
// src/config/config.unittest
export default {
  // ...
  express: {
    port: null
  },
}
```

In addition, you can also temporarily modify the port by `midway-bin dev-ts-port = 6001`, which overwrites the configured port.



### Global prefix

For more information about this feature, see [Global Prefixes](../controller# Global Routing Prefix).



### Https configuration

In most cases, please use external agents as much as possible to complete the implementation of Https, such as Nginx.

In some special scenarios, you can directly turn on Https by configuring SSL certificates (TLS certificates).

First, you must prepare certificate files in advance, such as `ssl.key` and `ssl.pem`. The key is the private key of the server and the pem is the corresponding certificate.

Then configure it.

```typescript
// src/config/config.default
import { readFileSync } from 'fs';
import { join } from 'path';

export default {
  // ...
  express: {
    key: join(__dirname, '../ssl/ssl.key')
    cert: join(__dirname, '../ssl/ssl.pem')
  },
}
```



### Modify context log

The context log of the express framework can be modified separately.

```typescript
export default {
  express: {
    contextLoggerFormat: info => {
      // equivalent req
      const req = info.ctx;
      const userId = req?.['session']?.['userId'] || '-';
      return '${info.timestamp} ${info.LEVEL} ${info.pid} [${userId} - ${Date.now() - req.startTime}ms ${req.method}] ${info.message}';
    }
    // ...
  },
};
```

