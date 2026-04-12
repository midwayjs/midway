# Change: Refactor Functional Dev Source Loader Boundary

## Why
当前 functional 前端一体化开发模式通过 `@midwayjs/mock` 在开发期直接加载 `src/server` 源码。为兼容 Node 20 下的 ESM + TypeScript + decorator 场景，临时将源码 fallback/转译逻辑加入了 `@midwayjs/core` 的 `loadModule()`。

这会把明显属于开发期、且仅在 `mock` 源码直跑链路中需要的逻辑沉入 core 基础加载层，导致职责边界模糊，并增加 core 的维护负担与回归风险。

## What Changes
- 将 functional 一体化开发期的源码加载逻辑从 `@midwayjs/core` 迁移到 `@midwayjs/mock`。
- 在 `@midwayjs/mock` 内部引入统一的 dev source loader，供 Vite 与 Rspack 开发插件共享。
- 将 `@midwayjs/core` 的 `loadModule()` 恢复为标准模块加载能力，不继续承载开发期源码 fallback/转译细节。
- 为 Node 20 + ESM + TypeScript + decorator + reflect metadata 的 functional 开发链路补充 mock 层回归测试。

## Impact
- Affected specs: `functional-web-routing`
- Affected code:
  - `packages/mock/src/creator.ts`
  - `packages/mock/src/vite.ts`
  - `packages/mock/src/rspack.ts`
  - `packages/mock/src/*`（新增 dev source loader）
  - `packages/core/src/util/index.ts`
  - `packages/mock/test/*`
