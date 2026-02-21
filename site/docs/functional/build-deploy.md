# 构建部署

Functional 一体化项目的实践建议是：开发一体化，部署分离化。

## 推荐脚本

```json
{
  "scripts": {
    "dev": "vite",
    "build:server": "tsc -p tsconfig.server.json",
    "build:web": "vite build",
    "build": "npm run build:server && npm run build:web"
  }
}
```

## 产物说明

- `dist/server`：给 Node 运行
- `dist/web`：静态资源（Nginx/CDN）

## 常见部署方式

1. 启动服务端：`node dist/server/bootstrap.js`
2. 将 `dist/web` 托管到静态服务
3. 前端请求通过同域或反向代理转到服务端 API

## SSR / SSG 场景

- 沿用前端框架官方流程
- Midway Functional 负责 API 契约和服务逻辑
- `basePath` 建议区分浏览器和服务端运行时配置

```ts
basePath: {
  browser: '/api',
  server: 'http://127.0.0.1:7001/api',
}
```
