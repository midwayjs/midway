---
title: 介绍
---

## ✨ 特性

- ☁️   全栈，在 src 一个目录中开发前后端代码
- 🌈  "零" API，从后端 import 函数，调用时自动转换为 API 请求
- 🌍 使用 "React Hooks | Vue composition Api" 开发后端
- ⚡️   极快的启动速度（小于 3 秒）
- ⚙️   使用 Vite，支持 React/Vue 等框架
- ✈️   可部署至 Server 或者 Serverless
- 🛡 完善的 TypeScript 支持

## ☁️ 应用结构

基于 Midway Hooks 开发应用有以下几点优势：

- **易于开发**，前后端同仓库，无缝融合一体开发
- **易于部署**，前后端一同发布与部署
- **易于维护**，在同一仓库中排查问题，后端支持使用 Serverless 部署，降低运维难度

> 目录结构

<img src="https://cdn.nlark.com/yuque/0/2021/png/98602/1622788353126-95c182d2-1462-4ff0-b166-51d6f3405f2d.png#clientId=uaba2bffc-e32b-4&from=paste&height=1866&id=u2422df2b&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1866&originWidth=1948&originalType=binary&ratio=1&size=199238&status=done&style=none&taskId=u29d9d308-25ac-4631-ba44-adfa132e044&width=1948" width="1948" />

## 🌰 代码示例

> 后端接口

```typescript
import { useContext } from '@midwayjs/hooks';

export async function getPath() {
  // Get HTTP request context by Hooks
  const ctx = useContext();
  return ctx.path;
}

export async function post(name: string) {
  const ctx = useContext();

  return {
    message: `Hello ${name}!`,
    method: ctx.method,
  };
}
```

> 前端调用

```typescript
import { getPath, post } from './apis/lambda';

// send GET request to /api/getPath
const path = await getPath();
console.assert(path === '/api/getPath');

const { message, method } = await post('Jake');

console.assert(message === 'Hello Jake!');
console.assert(method === 'POST');
```
