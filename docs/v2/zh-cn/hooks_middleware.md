---
title: Web 中间件
---

在 2.0 版本中，Midway Hooks 支持三种形式的中间件，用来覆盖不同的使用诉求。

- 2.0 全局，对所有 Api 调用都生效
- 2.0 文件，对文件内部所有 Api 生效
- 1.0 函数，仅对该 Api 函数生效

##

## 语法

中间件仅有 `next` 一个参数，`ctx` 需要通过 `useContext` 获得。你也可以在中间件中使用任意的 `Hooks`。

> Logger 中间件

```typescript
import { Context } from '@midwayjs/faas';
import { useContext } from '@midwayjs/hooks';

const logger = async (next: any) => {
  const ctx = useContext<Context>();

  console.log(`<-- [${ctx.method}] ${ctx.url}`);

  const start = Date.now();
  await next();
  const cost = Date.now() - start;

  console.log(`[${ctx.method}] ${ctx.url} ${cost}ms`);
};
```

### 全局中间件

全局中间件在 `configuration.ts` 中定义，可以传入任何框架支持的中间件

```typescript
import { hooks, createConfiguration } from '@midwayjs/hooks';
import logger from './logger';

// Global Middleware
export default createConfiguration({
  imports: [
    hooks({
      middleware: [logger],
    }),
  ],
});
```

### 文件级中间件

文件级中间件在 Api 文件中定义，通过导出 `config.middleware`，使得其对该文件内所有 Api 函数生效。

```typescript
import { ApiConfig } from '@midwayjs/hooks';
import logger from './logger';

// File Level Middleware
export const config: ApiConfig = {
  middleware: [logger],
};

export default async (message: string) => {
  return { type: 'POST', message };
};
```

## 单函数中间件

单函数中间件即只针对单个函数生效的 Web 中间件。

在 Midway Hooks 中，可以通过 `withController` 来支持单函数级别的中间件。
​

> 使用函数中间件

```typescript
import { withController } from '@midwayjs/hooks';
import { Context } from '@midwayjs/faas';

const logger = async (next) => {
  const ctx: Context = useContext();

  const start = Date.now();
  await next();
  const cost = Date.now() - start;
  console.log(`request ${ctx.url} cost ${cost}ms`);
};

export default withController(
  {
    middleware: [logger],
  },
  () => {
    return 'Hello Controller';
  }
);
```

> 使用 IoC 中间件

```typescript
import { withController } from '@midwayjs/hooks';
import { Context } from '@midwayjs/faas';
import { Provide, ScopeEnum, Scope } from '@midwayjs/decorator';

@Provide('classMiddleware')
@Scope(ScopeEnum.Singleton)
export class ClassMiddleware {
  resolve() {
    return async (ctx: Context, next) => {
      ctx.query.from = 'classMiddleware';
      await next();
    };
  }
}

export default withController(
  {
    middleware: ['classMiddleware'],
  },
  () => {
    return 'Hello Controller ' + ctx.query.from;
  }
);
```

## API

## withController

通过 `withController` 增强函数功能，第一个参数是 controller 配置，第二个参数是要执行的 FaaS 函数。

其中 controller 配置如下

- middleware（`any[]`）：可选参数，用于给当前的函数增加中间件功能，可以同时传入多个中间件。支持函数定义的中间件及 IoC 定义的中间件。

> 类型定义

```typescript
type Controller = {
  middleware?: any[];
};

function withController(controller: Controller, func);
```
