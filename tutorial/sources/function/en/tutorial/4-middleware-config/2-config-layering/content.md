---
type: lesson
title: Config Layering and Local Port
focus: /src/server/config/config.default.ts
prepareCommands:
  - npm install
mainCommand: npm run dev
terminal:
  open: false
  panels:
    - output
    - terminal
previews:
  - port: 7001
    title: Midway App
autoReload: true
---

# Config Layering and Local Port

Use layered config:

- `config.default.ts`
- `config.local.ts` (`koa.port = null`)

Declare both in `importConfigs` for clear environment boundaries.
