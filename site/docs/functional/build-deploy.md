# 构建与部署

## 目标

- 开发期：一体化体验（前后端同仓）
- 发布期：前后端产物分离（独立部署）

## 建议脚本

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

## 产物

- server: `dist/server`（Node 启动）
- web: `dist/web`（静态资源）

## CSR 部署

1. 启动 server（例如 `node dist/server/bootstrap.js`）
2. 静态资源由 CDN/Nginx 或静态服务托管
3. 前端请求指向 server API 地址（同域或反向代理）

## SSR / SSG 说明

- 沿用前端框架官方构建部署流程
- Midway functional API 作为服务层契约，不替代框架 SSR/SSG pipeline
- `basePath` 需要按浏览器与服务端运行时分别配置

示例：

```ts
basePath: {
  browser: '/api',
  server: 'http://127.0.0.1:7001/api',
}
```
