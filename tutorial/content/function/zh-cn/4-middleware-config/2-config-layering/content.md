---
title: 配置覆盖与本地端口
focus: /src/server/config/config.default.ts
preview: /api
---

# 配置覆盖与本地端口

Midway 按环境叠配置。这一课显式加载了两层：

- `config.default.ts`：所有环境的底稿，这里把 `koa.globalPrefix` 设成 `/api`
- `config.local.ts`：本地开发覆盖，例如 `koa.port`

`NODE_ENV=local` 时会合并 `default + local`。测试环境则读 `config.unittest.ts`（`port: null`，避免和 dev 抢 7001）。

在 handler 里用 `useConfig` 读配置：

```ts
return {
  name: useConfig('app.name'),
  prefix: useConfig('koa.globalPrefix'),
};
```

加了 `globalPrefix` 之后，原来的 `/` 变成 `/api`。所以本课预览打开的是 `/api`。如果前端 `createClient` 的 `basePath` 还是空的，请求会 404，需要改成 `/api`。
