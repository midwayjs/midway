---
title: Error boundary
focus: /src/server/api/user.api.ts
---

# Error boundary

Split errors into three layers:

1. **Input errors**: stop them with `.input()` before business code
2. **Business errors**: throw a clear `MidwayHttpError` in the handler
3. **Response shape**: a global filter should return JSON, not Koa's default HTML error page

`ValidationError`, `NotFoundError`, and `DefaultErrorFilter` are already in the project. The filter does nothing until you register it in `onReady`:

```ts
async onReady(_container, app) {
  app.useFilter([DefaultErrorFilter]);
}
```

## Exercise

Open `src/server/index.ts` and register `DefaultErrorFilter`. Then POST `/users` with an invalid body — the response should be JSON (`success: false`), not an HTML page.
