---
title: Config Layering and Local Port
focus: /src/server/config/config.default.ts
preview: /api
---

# Config Layering and Local Port

Use layered config:

- `config.default.ts`
- `config.local.ts` (overrides for local development, such as `koa.port`)

Declare both in `importConfigs` for clear environment boundaries.
