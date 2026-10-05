---
title: 路由级与模块级中间件
focus: /src/server/middleware/logger.middleware.ts
---

# 路由级与模块级中间件

Functional API 支持两种挂载方式：

- 模块级：`defineApi(..., { middleware: [...] })`
- 路由级：`.meta({ middleware: [...] })`

建议把日志、鉴权、限流等通用能力放模块级。
