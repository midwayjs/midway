# Web Middleware

Midway Hooks supports defining Web middleware through function + `useContext()`.

## Grammar

The middleware has only one parameter `next`. `ctx` needs to be obtained by `useContext`. You can also use any `Hooks` in the middleware.

### Basic example

Take recording request logs as an example:

```typescript
import { Context } from '@midwayjs/koa';
import { useContext } from '@midwayjs/hooks';

const logger = async (next: any) => {
  const ctx = useContext<Context>();

  console.log (
    '<-- [${ctx.method}] ${ctx.url}'
  );

  const start = Date.now();
  await next();
  const cost = Date.now() - start;

  console.log (
    '--> [${ctx.method}] ${ctx.url} ${cost}ms'
  );
};
```

## Global middleware

Global middleware is defined in `configuration.ts`, and the middleware defined here takes effect for all interfaces.

```typescript
import {
  hooks
  createConfiguration
} from '@midwayjs/hooks';
import logger from './logger';

// Global Middleware
export default createConfiguration({
  imports: [
    // highlight-start
    hooks({
      middleware: [logger],
    }),
    // highlight-end
  ],
});
```

## File-level middleware

File-level middleware is defined in the Api file. Through the exported `config.middleware`, the middleware takes effect on all Api functions in the file.

```typescript
import {
  ApiConfig
  Api
  Get
} from '@midwayjs/hooks';
import logger from './logger';

// File Level Middleware
// highlight-start
export const config: ApiConfig = {
  middleware: [logger]
};
// highlight-end

export default Api(Get(), async () => {
  return 'Hello World!';
});
```

## Single function middleware

Middleware defined by `Middleware(... Middlewares: HooksMiddleware[])` takes effect only for a single function

```ts
import {
  Api
  Get
  Middleware
} from '@midwayjs/hooks';
import logger from './logger';

export default Api (
  Get()
  // highlight-start
  Middleware(logger)
  // highlight-end
  async () => {
    return 'Hello World!';
  }
);
```

## Using Koa middleware

You can pass in the Koa middleware directly in the above example.

Take [@koa/cors](https://www.npmjs.com/package/@koa/cors) as an example.

Global Enabled:

```ts
import {
  hooks
  createConfiguration
} from '@midwayjs/hooks';
import logger from './logger';
import cors from '@koa/cors';

// Global Middleware
export default createConfiguration({
  imports: [
    hooks({
      // highlight-start
      middleware: [logger, cors()]
      // highlight-end
    }),
  ],
});
```

File level enabled:

```ts
import {
  ApiConfig
  Api
  Get
} from '@midwayjs/hooks';
import logger from './logger';
import cors from '@koa/cors';

// File Level Middleware
// highlight-start
export const config: ApiConfig = {
  middleware: [logger, cors]
};
// highlight-end

export default Api(Get(), async () => {
  return 'Hello World!';
});
```

Function level enabled:

```ts
import {
  Api
  Get
  Middleware
} from '@midwayjs/hooks';
import logger from './logger';
import cors from '@koa/cors';

export default Api (
  Get()
  // highlight-start
  Middleware(logger, cors)
  // highlight-end
  async () => {
    return 'Hello World!';
  }
);
```
