# Vue / Nuxt 集成设计

这一篇用于统一说明 Vue 和 Nuxt 的一体化方向。

## 当前状态

- `@midwayjs/vue`：未发布（尚未实现）
- `@midwayjs/nuxt`：未发布（尚未实现）
- 当前可用桥接能力为 `@midwayjs/api-bridge`，以及已落地的 `@midwayjs/react` / `@midwayjs/nextjs`

## Vue（Vite）集成

Vue 目标与 React 一致：

- 复用 `src/server/api` 定义
- 在组件里直接调用 typed client
- 构建期改写 `server/api` 导入，浏览器不打入 Midway runtime

最小调用形态：

```ts
// src/web/api/client.ts
import { createClient } from '@midwayjs/api-bridge';
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

## Nuxt 集成（服务层适配）

Nuxt 侧原则：

- 保留 Nuxt/Nitro 原生路由
- Midway 负责 API 定义与桥接调用语义
- 通过 module/composable 暴露 `$api` 或 `useApiClient()`

示意：

```ts
// composables/useApiClient.ts
import { createClient } from '@midwayjs/api-bridge';
import { userApi } from '~/server/api';

export const useApiClient = () =>
  createClient(
    { user: userApi },
    {
      basePath: '/api',
    }
  );
```

### Nuxt module / composable 设计示例

```ts
// modules/midway-api.ts
export default function midwayApiModule() {
  // 1) 读取 server/api 定义
  // 2) 生成 runtime 可用 composable
  this.addTemplate({
    filename: 'midway-api.client.mjs',
    getContents: () => `
      import { createClient } from '@midwayjs/api-bridge';
      import { userApi } from '~/server/api/user.api';
      export const api = createClient({ user: userApi }, { basePath: '/api' });
    `,
  });

  this.addPlugin({
    src: this.addTemplate({
      filename: 'midway-api.plugin.mjs',
      getContents: () => `
        import { api } from '#build/midway-api.client.mjs';
        export default defineNuxtPlugin(() => ({ provide: { api } }));
      `,
    }).dst,
  });
}
```

```vue
<!-- pages/users/[id].vue -->
<script setup lang="ts">
const { $api } = useNuxtApp();
const route = useRoute();
const user = await $api.user.getUser({
  params: { id: String(route.params.id) },
});
</script>
```

## 推荐状态

- React / Next.js：已作为 Phase 1 优先落地
- Vue / Nuxt：作为 Phase 2 按同一 bridge 契约推进

## 示例

- Vue（Vite）示例：`samples/vue-functional-api`
