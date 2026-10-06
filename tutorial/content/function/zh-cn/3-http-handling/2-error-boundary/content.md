---
title: 错误边界与返回规范
preview: /users/u-1
focus: /src/server/api/user.api.ts
routes:
  - /users/u-1
  - /users/missing
---

# 错误边界与返回规范

建议把错误分成三层：

1. **参数错误**：尽量用 `.input()` 在进入业务前拦住
2. **业务错误**：在 handler 里抛明确的异常（自定义 `MidwayHttpError`）
3. **响应格式**：用全局 Filter 统一成 JSON，不要把 Koa 默认的 HTML 错误页丢给前端

右侧已经有 `ValidationError`、`NotFoundError` 和 `DefaultErrorFilter`。过滤器不会自动生效，必须在 `defineConfiguration` 的 `onReady` 里注册：

```ts
async onReady(_container, app) {
  app.useFilter([DefaultErrorFilter]);
}
```

## 练习

打开 `src/server/index.ts`，把 `DefaultErrorFilter` 注册上。完成后再用非法 body 调 `POST /users`，响应应是 JSON（`success: false`），而不是一整页 HTML。
