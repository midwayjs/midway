---
type: lesson
title: 配置覆盖与本地端口
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
    title: Midway 应用
autoReload: true
---

# 配置覆盖与本地端口

本课使用两层配置：

- `config.default.ts`
- `config.local.ts`（`koa.port = null`）

通过 `importConfigs` 显式声明 `default + local`，保持本地开发和部署配置解耦。
