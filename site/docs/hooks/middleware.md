---
title: Web 中间件
---

Midway Hooks 支持通过函数 + `useContext()` 来定义 Web 中间件。

## 语法

中间件仅有 `next` 一个参数，`ctx` 需要通过 `useContext` 获得。你也可以在中间件中使用任意的 `Hooks`。

### 基础示例

以记录请求日志为例：

```typescript
import { Context } from '@midwayjs/koa';
import { useContext } from '@midwayjs/hooks';

const logger = async (next: any) => {
  const ctx = useContext<Context>();

  console.log(
    `<-- [${ctx.method}] ${ctx.url}`
  );

  const start = Date.now();
  await next();
  const cost = Date.now() - start;

  console.log(
    `--> [${ctx.method}] ${ctx.url} ${cost}ms`
  );
};
```

## 全局中间件

全局中间件在 `configuration.ts` 中定义，此处定义的中间件对所有接口生效。

```typescript
import {
  hooks,
  createConfiguration,
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

## 文件级中间件

文件级中间件在 Api 文件中定义，通过导出的 `config.middleware`，该中间件对文件内所有 Api 函数生效。

```typescript
import {
  ApiConfig,
  Api,
  Get,
} from '@midwayjs/hooks';
import logger from './logger';

// File Level Middleware
// highlight-start
export const config: ApiConfig = {
  middleware: [logger],
};
// highlight-end

export default Api(Get(), async () => {
  return 'Hello World!';
});
```

## 单函数中间件

通过 `Middleware(...middlewares: HooksMiddleware[])` 定义的中间件仅对单个函数生效

```ts
import {
  Api,
  Get,
  Middleware,
} from '@midwayjs/hooks';
import logger from './logger';

export default Api(
  Get(),
  // highlight-start
  Middleware(logger),
  // highlight-end
  async () => {
    return 'Hello World!';
  }
);
```

## 使用 Koa 中间件

你可以在上述的例子中直接传入 Koa 中间件。

以 [@koa/cors](https://www.npmjs.com/package/@koa/cors) 为例

全局启用:

```ts
import {
  hooks,
  createConfiguration,
} from '@midwayjs/hooks';
import logger from './logger';
import cors from '@koa/cors';

// Global Middleware
export default createConfiguration({
  imports: [
    hooks({
      // highlight-start
      middleware: [logger, cors()],
      // highlight-end
    }),
  ],
});
```

文件级别启用：

```ts
import {
  ApiConfig,
  Api,
  Get,
} from '@midwayjs/hooks';
import logger from './logger';
import cors from '@koa/cors';

// File Level Middleware
// highlight-start
export const config: ApiConfig = {
  middleware: [logger, cors],
};
// highlight-end

export default Api(Get(), async () => {
  return 'Hello World!';
});
```

函数级别启用：

```ts
import {
  Api,
  Get,
  Middleware,
} from '@midwayjs/hooks';
import logger from './logger';
import cors from '@koa/cors';

export default Api(
  Get(),
  // highlight-start
  Middleware(logger, cors),
  // highlight-end
  async () => {
    return 'Hello World!';
  }
);
```
