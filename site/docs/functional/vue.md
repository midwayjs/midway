# Vue 集成设计

这一篇用于说明 Vue 的一体化集成方式。

## 当前状态

- `@midwayjs/vue`：已提供 Vue 专属集成（provider/composable）
- 通用桥接能力由 `@midwayjs/web-bridge` 提供

## Vue（Vite）集成

Vue 目标与 React 一致：

- 复用 `src/server/api` 定义
- 在组件里直接调用 typed client
- 构建期改写 `server/api` 导入，浏览器不打入 Midway runtime

最小调用形态：

```ts
// src/web/api/client.ts
import { createClient } from '@midwayjs/vue';
import { userApi } from '../../server/api';

export const api = createClient(
  { user: userApi },
  {
    basePath: '/api',
  }
);
```

```ts
// Vue setup()
const user = await api.user.getUser({
  params: { id: 'u-1' },
});
```

### 同仓开发目录（server + vue）

```txt
src/
  server/
    configuration.ts
    api/
      user.api.ts
  web/
    main.ts
    app.vue
    api/
      client.ts
```

开发流程（单仓）：

1. server 负责 API 运行时与 `defineApi` 声明
2. web 直接复用 `src/server/api` 类型与语义
3. dev/build 阶段通过桥接层把 API 调用转为 web-safe 请求

### Vue Router（基于 manifest）

```ts
import type { RouteRecordRaw } from 'vue-router';
import type { RouteManifestItem } from '@midwayjs/core';
import { api } from '@/web/api/client';

export function toVueRoutes(manifest: RouteManifestItem[]): RouteRecordRaw[] {
  return manifest
    .filter(item => item.method.toLowerCase() === 'get')
    .map(item => ({
      name: item.operationId,
      path: item.fullPath,
      component: () => import('@/web/pages/api-proxy-page.vue'),
      beforeEnter: async to => {
        if (item.operationId === 'user.getUser') {
          await api.user.getUser({ params: to.params });
        }
      },
    }));
}
```

## 示例

- Vue（Vite）示例：`samples/vue-functional-api`
