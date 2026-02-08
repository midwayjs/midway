---
type: lesson
title: Middleware Basics
focus: /src/middleware/logger.middleware.ts
prepareCommands:
  - npm install
mainCommand: npm run dev
terminal:
  open: true
  panels:
    - output
    - terminal
previews:
  - port: 7001
    title: Midway App
autoReload: true
---

# Middleware Basics

Middleware runs before and after controller execution.

## Request pipeline

```text
Request
  -> Middleware A
  -> Middleware B
  -> Controller
  <- Middleware B
  <- Middleware A
Response
```

## Typical middleware use cases

- Authentication
- Logging
- Performance timing
- Security checks
- Data transformation
- Rate limiting

## Create a logger middleware

```typescript
import { Middleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';

@Middleware()
export class LoggerMiddleware {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const startTime = Date.now();
      console.log(`-> ${ctx.method} ${ctx.url}`);

      await next();

      const duration = Date.now() - startTime;
      console.log(`<- ${ctx.method} ${ctx.url} ${ctx.status} ${duration}ms`);
    };
  }
}
```

## Register middleware

```typescript
import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import { LoggerMiddleware } from './middleware/logger.middleware';

@Configuration({
  imports: [koa],
})
export class MainConfiguration {
  @App()
  app: koa.Application;

  async onReady() {
    this.app.useMiddleware([LoggerMiddleware]);
  }
}
```

## Verify in output panel

Visit `GET /middleware-demo` (or any route) and check logs in `output`.

## Summary

- Middleware wraps request lifecycle
- `await next()` is required for proper flow
- Register global middleware in `onReady`
