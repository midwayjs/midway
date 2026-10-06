---
title: 路由级与模块级中间件
focus: /src/server/middleware/logger.middleware.ts
checks:
  - /middleware-demo
---

# 路由级与模块级中间件

Functional 中间件是普通的 `(ctx, next) =>` 函数，两种挂法：

- **模块级**：`defineApi(prefix, routes, { middleware: [...] })`，这个模块下每条路由都会经过
- **路由级**：`.meta({ middleware: [...] })`，只作用于这一条

右侧起点代码把日志中间件挂在模块级。访问 `/` 或 `/middleware-demo`，终端里都会看到 `[req]` / `[res]`。

全局 Filter、全局中间件仍然在 `onReady` 里用 `app.useFilter` / `app.useMiddleware` 注册，和 Class 写法一样。

## 练习

改成只给 `/middleware-demo` 挂日志中间件（用 `.meta`），模块级的 `middleware` 去掉。完成后：访问 `/` 不应再打这条日志，访问 `/middleware-demo` 还应有日志。
