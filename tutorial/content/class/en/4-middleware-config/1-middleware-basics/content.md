---
title: Middleware Basics
preview: /middleware-demo
focus: /src/middleware/logger.middleware.ts
routes:
  - /
  - /middleware-demo
checks:
  - /health
---

# Middleware Basics

Middleware runs before and after the controller. Think of it as checkpoints around the handler.

```text
Request
  -> Logger
  -> Controller
  <- Logger
Response
```

Typical uses: auth, logging, timing, CORS, rate limiting.

## A logger middleware

The file on the right is already wired up:

```typescript
@Middleware()
export class LoggerMiddleware {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const startTime = Date.now();
      console.log(`→ ${ctx.method} ${ctx.url}`);
      await next();
      const duration = Date.now() - startTime;
      console.log(`← ${ctx.method} ${ctx.url} ${ctx.status} ${duration}ms`);
    };
  }
}
```

Register it in `onReady`:

```typescript
async onReady() {
  this.app.useMiddleware([LoggerMiddleware]);
}
```

Visit `/middleware-demo` and watch the terminal.

You must `await next()`. If you forget, the controller never runs.

## Exercise

Add `GET /health` that returns `{ ok: true }`, and skip the logger for that path:

```typescript
if (ctx.path === '/health') {
  return next();
}
```

`/health` should not print `→` / `←`. Use **Solve** if you get stuck.
