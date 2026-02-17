# 一体化目录与边界

## 推荐目录（可配置）

```txt
src/
  server/
    configuration.ts
    api/
      index.ts
      user.api.ts
  web/
    main.tsx
    app.tsx
    api/
      client.ts
```

默认示例约定：

- `serverDir`: `src/server`
- `webDir`: `src/web`
- `apiDir`: `src/server/api`

这些不是强制目录，用户可以按项目结构配置。

## 单一真相源

`src/server/api` 同时承担：

- 服务端路由语义（method/path/input/output）
- 前端调用类型来源

前端不需要再维护一份 `shared-contracts`。

## 边界规则

前端可依赖：

- `defineApi` 导出的 API 定义
- schema/type 导出

前端不可打包：

- Midway server runtime
- Node-only 模块（`fs` / `path` / `net` 等）
- handler 内部服务端实现细节

## 单命令开发

推荐单 dev 入口（例如 Vite）：

1. 内嵌启动 Midway HTTP runtime（dev plugin）
2. 前端构建期把 `server/api` 导入改写成 web-safe 客户端调用

用户只执行一个 `npm run dev`。

## 发布分离

构建期拆分两份产物：

- server 产物（Node 运行）
- web 产物（浏览器运行）

部署时按前后端独立发布。
