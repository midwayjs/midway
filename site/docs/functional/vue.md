# Vue 集成

这篇和 React 一样，先保证你能快速接通调用链路。

## 1. 创建客户端

```ts
// src/web/api/client.ts
import { createClient } from '@midwayjs/vue';
import { userApi } from '../../server/api/user.api';

export const api = createClient(
  { user: userApi },
  { basePath: '/api' }
);
```

## 2. 在组件中调用

```ts
// Vue setup()
const user = await api.user.getUser({
  params: { id: 'u-1' },
});
```

## 3. 推荐目录

```txt
src
├── server
│   └── api
│       └── user.api.ts   # 用户 API 定义（defineApi）
└── web
    ├── app.vue           # 前端应用根组件
    └── api
        └── client.ts     # 前端 API 客户端创建
```

## 4. 开发时你需要知道的事

- server 负责 API 定义与运行时逻辑
- web 直接复用 `src/server/api` 契约
- 构建阶段由桥接层处理浏览器可运行转换

## 示例

- `samples/vue-functional-api`
