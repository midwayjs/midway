---
title: Route-level and module-level middleware
preview: /middleware-demo
focus: /src/server/middleware/logger.middleware.ts
routes:
  - /
  - /middleware-demo
checks:
  - /middleware-demo
---

# Route-level and module-level middleware

Functional middleware is a plain `(ctx, next) =>` function. Two ways to attach it:

- **Module-level**: `defineApi(prefix, routes, { middleware: [...] })` — every route in the module
- **Route-level**: `.meta({ middleware: [...] })` — that route only

The starter attaches the logger at module level. Hit `/` or `/middleware-demo` and you will see `[req]` / `[res]` in the terminal.

Global filters and middleware still go through `onReady` with `app.useFilter` / `app.useMiddleware`, same as the class style.

## Exercise

Attach the logger only on `/middleware-demo` with `.meta`, and remove the module-level `middleware`. `/` should stop logging; `/middleware-demo` should still log.
