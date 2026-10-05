---
title: Config layering and local port
focus: /src/server/config/config.default.ts
preview: /api
---

# Config layering and local port

Midway stacks config by environment. This lesson loads two layers:

- `config.default.ts`: the base for every environment. Here `koa.globalPrefix` is `/api`
- `config.local.ts`: local overrides such as `koa.port`

`NODE_ENV=local` merges `default + local`. Tests read `config.unittest.ts` (`port: null`) so they do not steal 7001 from dev.

Read config in a handler with `useConfig`:

```ts
return {
  name: useConfig('app.name'),
  prefix: useConfig('koa.globalPrefix'),
};
```

With `globalPrefix`, `/` becomes `/api`. That is why this lesson's preview opens `/api`. If the client's `basePath` is still empty, requests 404 until you set it to `/api`.
