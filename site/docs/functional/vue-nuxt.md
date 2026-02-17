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

## 推荐状态

- React / Next.js：已作为 Phase 1 优先落地
- Vue / Nuxt：作为 Phase 2 按同一 bridge 契约推进
