---
type: lesson
title: 路由级与模块级中间件
focus: /src/server/middleware/logger.middleware.ts
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
    title: Midway 应用
autoReload: true
---

# 路由级与模块级中间件

Functional API 支持两种挂载方式：

- 模块级：`defineApi(..., { middleware: [...] })`
- 路由级：`.meta({ middleware: [...] })`

建议把日志、鉴权、限流等通用能力放模块级。
