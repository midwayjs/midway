# 目录与编辑

这一页解决两个常见问题：

- 代码应该放在哪里？
- 前端到底可以引用什么？

## 推荐目录

```txt
src
├── server
│   ├── index.ts          # Midway 服务端入口（也可命名为 configuration.ts）
│   └── api
│       └── user.api.ts   # 用户 API 定义（defineApi）
└── web
    ├── main.tsx          # 前端启动入口
    ├── app.tsx           # 前端应用根组件
    └── api
        └── client.ts     # 前端 API 客户端创建
```

默认约定：

- `serverDir`: `src/server`
- `webDir`: `src/web`
- `apiDir`: `src/server/api`

可改，不是强制。

## 前端可引用 / 不可引用

前端可引用：

- `src/server/api` 导出的 API 定义
- 类型和 schema

前端不要引用：

- Node-only 模块（`fs` / `path` / `net`）
- 服务端运行时代码
- handler 内部实现细节

## 为什么这样划分

因为 `src/server/api/*.api.ts` 既是服务端路由契约，也是前端类型来源。

统一这一层后，可以减少重复定义和联调偏差。

## 开发和发布

开发期：建议一个 `npm run dev` 入口。  
发布期：仍然前后端分离产物和部署。

## `web/api` 目录如何自定义

`src/web/api` 只是推荐目录，不是强制。你可以改成：

- `src/client/api`
- `src/web/sdk`
- 或任意团队习惯目录

重点是保持两件事一致：

1. 你的前端 client 文件导入路径
2. 构建插件里的 `apiDir`（服务端 API 定义目录）

Vite 示例（把服务端 API 目录改为 `src/contracts/api`）：

```ts
apiPlugin({
  root: process.cwd(),
  apiDir: 'src/contracts/api',
  target: 'both',
});
```

Rspack 示例：

```ts
createApiRspackRule({
  root: process.cwd(),
  apiDir: 'src/contracts/api',
});
```

如果你同时改了 server 根目录，也要同步调整 `devPlugin` 的 `baseDir`。
