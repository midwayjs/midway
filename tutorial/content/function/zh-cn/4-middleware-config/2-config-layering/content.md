---
title: 配置覆盖与本地端口
focus: /src/server/config/config.default.ts
preview: /api
---

# 配置覆盖与本地端口

本课使用两层配置：

- `config.default.ts`
- `config.local.ts`（本地开发环境的覆盖项，例如 `koa.port`）

通过 `importConfigs` 显式声明 `default + local`，保持本地开发和部署配置解耦。
