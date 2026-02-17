# Change: 提供 Midway Web 装饰器的 Functional API（前端一体化 + 纯函数式服务）

## Why
Midway 目前在 Web 场景的主流入口仍然以 `@Controller`、`@Get`、`@Post` 等类/方法装饰器为核心。该模式在 Node.js 服务端体验成熟，但在 React、Vue、Next.js、NestJS 以及更多前端工程化场景中，用户更常使用函数式声明、文件路由、组合式 API 与跨运行时共享模块。

虽然仓库已提供 `defineConfiguration`，但控制器与路由声明仍缺少与之对齐的 Functional 形态。这会导致：

1. 用户难以在前后端共享同一套路由定义模型。
2. 前端生态难以复用 Midway 的路由元信息（method/path/middleware/version）。
3. 想在非装饰器或装饰器受限环境中使用 Midway 风格路由时缺乏官方入口。

本提案目标是先完成“用户视角”的 API 设计与规范化定义，为后续实现提供明确行为边界。
同时明确：functional 与 class decorator 是并行风格选择，不是替代关系。
并且 functional API 不只服务于前端集成，也应支持“纯函数式 Midway 服务”作为独立开发范式。

## What Changes
- 新增 capability：`functional-web-routing`。
- 定义与 `@Controller`、`@Get`、`@Post` 等等价的 Functional 声明模型，首选 `defineApi('/prefix', api => ({ ... }))` 的链式 DSL，并将 API 放在 `@midwayjs/core/functional`。
- 定义前端生态可消费的标准化路由描述对象（Route Definition），便于 React Router、Vue Router、Next Route Handler、Nest Adapter 等接入。
- 明确与现有 Decorator 元数据的一致性要求（prefix、method、middleware、version、ignoreGlobalPrefix 等）。
- 明确 `defineApi` 复用现有 class 装饰器元数据定义与收集协议，不新增平行元数据体系。
- 给出用户侧示例与迁移路径（装饰器与 functional 可并存，不破坏既有应用）。
- 在文档定位上明确“偏好共存”原则：class 写法继续为一等公民，functional 写法为前端友好的等价入口。
- 明确纯后端场景可仅使用 functional API 完成 Midway 服务开发（不依赖前端框架集成）。
- 设计从 HTTP 扩展为多协议模型：HTTP/gRPC/WS/Socket.IO 按协议分别导出 define API 与 client adapter。

## User API Draft (for review)
提案阶段先冻结“用户如何写”，实现阶段再落地具体文件与运行时细节。

```ts
import {
  defineConfiguration,
  defineApi,
  useInject,
} from '@midwayjs/core/functional';
import { z } from 'zod';

export default defineApi('/users', api => ({
  getUser: api
    .get('/:id')
    .input({
      params: z.object({ id: z.string() }),
    })
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .handle(async ({ input }) => {
      const userService = await useInject('userService');
      return userService.find(input.params.id);
    }),

  createUser: api
    .post('/')
    .input({
      body: z.object({ name: z.string().min(1) }),
    })
    .handle(async ({ input }) => {
      const userService = await useInject('userService');
      return userService.create(input.body);
    }),
}));
```

```ts
// src/configuration.ts
import { defineConfiguration } from '@midwayjs/core/functional';

export default defineConfiguration({
  // 不需要 `web.apis` 嵌套注册
  // defineApi 模块通过业务侧 detector 显式发现，或入口导出加载
  imports: [],
});
```

## Fullstack Integration Draft (React/Vue)
目标：前后端在同一仓库开发，复用 API 定义与类型，构建产物分离。

也支持 Next.js 的“前后端一体”模式（优先简化方案）。

Next.js 一体化最小目录：

```txt
src/
  app/
    page.tsx
    api/
      users/[id]/route.ts
  api/
    user.api.ts             # defineApi（可选，与 route handler 映射）
```

在该模式下：
1. 一个应用同时承载页面与接口。
2. API 定义可直接由 `server/api` 作为单一真相源。
3. 不强制拆分独立 `server` 与 `web` 工程。

建议目录（默认示例，可配置）：

```txt
src/
  server/
    api/
      user.api.ts           # defineApi
    configuration.ts
  web/                      # React 或 Vue 二选一落地
    main.tsx|main.ts
```

开发模式：
1. `serverDir`（默认示例为 `src/server`）负责 API runtime（Midway）。
2. `webDir`（默认示例为 `src/web`）直接依赖 `apiDir`（默认示例为 `src/server/api`）的 API 定义（method/path/schema/type）。
3. dev 阶段通过内存编译重写调用，抹平 Node 运行时差异。

构建分离：
1. `server` 单独构建并运行。
2. `web` 单独构建前端产物。
3. 发布阶段由构建工具从 `apiDir` 提取 web-safe client/types 供前端产物使用。
4. CI 按 `server-api-check -> server-build -> web-build` 执行。

用户体验目标：
1. 声明风格与 `defineConfiguration` 保持一致。
2. `api.get/post/... + input/output/handle` 形成稳定链式 DSL。
3. 路由选项与装饰器参数语义对齐，避免二义性。
4. 可导出 route manifest 给前端框架，不强制耦合特定 runtime。
5. 路由 DSL 由 core 官方维护（`@midwayjs/core/functional`），避免多入口分裂。
6. IoC 使用体验保持连续：使用 `useInject`（hooks 风格）。
7. 注册模型直觉化：避免 `web.apis` 这种额外嵌套配置，发现规则对齐 v4 detector。
8. 前后端一体化开发时，`apiDir`（默认示例为 `server/api`）作为单一真相源，避免重复维护 contracts。
9. 前端调用体验可“像直接依赖后端 API”，无需手写 fetch/axios 细节。

## Unified DX (Direct-like API Access)
目标是在一体化开发中抹平前后端调用心智差异：

```ts
// web/api/client.ts
import { createClient } from '@midwayjs/react';
import { userApi } from '@/server/api';

export const api = createClient(
  {
    user: userApi,
  },
  {
    basePath: '/api',
  }
);

const user = await api.user.getUser({ params: { id: '1' } });
```

设计原则：
1. `defineApi` 是唯一真相源（method/path/input/output）。
2. 前端开发期直接导入 `server/api` 定义，编译层在内存中将调用重写为客户端请求实现。
3. 运行时仍通过 HTTP 调用，开发体验上接近“直接函数调用”。
4. 传输层可插拔：默认 HTTP，同时允许用户接入自定义调用实现（如 tRPC）。
5. 客户端实现可替换：同一协议支持 fetch/axios 等多客户端适配。
6. 协议可扩展：除 HTTP 外，支持 gRPC/WS/Socket.IO 的 define API 与 client adapter。

## Pure Functional Midway Service Draft
目标：不引入 class/controller 装饰器，也能完整开发 Midway 服务。

```ts
import { defineApi, useInject } from '@midwayjs/core/functional';
import { z } from 'zod';

export default defineApi('/users', api => ({
  getUser: api
    .get('/:id')
    .input({
      params: z.object({ id: z.string() }),
    })
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .handle(async ({ input }) => {
      const userService = await useInject('userService');
      return userService.find(input.params.id);
    }),
}));
```

## Framework Integration Blueprint
下面是四种主流前端框架的集成设计重点。

实施优先级（冻结）：
1. Phase 1：`@midwayjs/nextjs` + `@midwayjs/react`
2. Phase 2：`@midwayjs/nuxt` + Vue 集成包
3. 所有 phase 共享同一 `src/server/api` 语义与 transport SPI，不回退 core 边界

### 1) Next.js（优先一体化）
- 目录：`src/app` + `src/server/api`
- 集成：通过 Next 插件在 dev/build 阶段重写 `server/api` 导入调用（用户代码保持不变）
- 路由：优先使用 Next 自身 `app/api` 或 `pages/api` 路由体系
- 调用：Client Component 直接使用 `server/api` 导出 API；Server Component/Route Handler 通过服务适配层访问 Midway 能力
- 产物：`next build` 时剥离 server runtime，仅保留 client 调用代理与类型

### 2) Nuxt（全栈一体化）
- 目录：`server/api` + `composables` + `server/midway-api`
- 集成：Nuxt module 在 dev 阶段扫描 `server/api`，生成 `$api` typed composable
- 路由：优先使用 Nuxt/Nitro 自身路由体系
- 调用：页面/组件中 `const { data } = await $api.users.getUser(...)`
- 产物：Nitro server 与 client bundle 分离，client 不包含 Midway runtime

### 3) React（分层单仓）
- 目录：`src/server` + `src/web`
- 集成：Vite/Rspack 插件在构建期重写 `src/server/api` 导入为 web-safe 调用
- 调用：React 组件/数据层直接使用 `server/api` 导出 API，不手写路径
- 产物：`web build` 只产出前端包；`server build` 独立运行

### 4) Vue（分层单仓）
- 目录：`src/server` + `src/web`
- 集成：Vite 插件与 Vue plugin 注入 `$api` 或 `useApiClient()`
- 调用：`const user = await api.users.getUser(...)`
- 产物：与 React 同策略，严格 server/web 产物分离

## Impact
- Affected specs: `functional-web-routing`（新增）
- Affected code（实施阶段预期）:
  - `packages/core/src/functional/*`（新增 web functional API）
  - `packages/core/src/decorator/web/*` 或路由收集层（元数据对齐）
  - `packages/core/src/service/webRouterService.ts`（消费统一路由定义）
  - `packages/api-bridge/*`（通用 client runtime + transport SPI）
  - `packages/nextjs/*`（Phase 1：Next.js 一体化桥接）
  - `packages/react/*`（Phase 1：React 桥接能力；如不存在则新增）
  - `packages/nuxt/*`、`packages/vue/*`（Phase 2）
  - `site/docs/*`（新增 functional routing 文档）
- Compatibility:
  - 向后兼容。装饰器 API 保持不变。
  - Functional API 作为增量能力引入。

## Scope Boundaries
- 本提案只定义规范与用户体验，不包含具体实现代码。
- 本提案不强制绑定任何单一前端框架，而是定义可被适配层消费的中立协议。
- 本提案中的 API 名称为草案，评审通过后在实现阶段冻结最终命名。
- 本次范围暂不包含 `@ServerlessTrigger` 对应 functional API 的实现与适配。
