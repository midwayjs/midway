## Context
当前 functional 一体化开发链路是：Vite/Rspack dev plugin -> `@midwayjs/mock.createApp()` -> `initializeGlobalApplicationContext()` -> `findProjectEntryFile()` -> `loadModule()` 直接加载 `src/server` 源码。

在 Node 20 + ESM + TypeScript + decorator 场景下，源码直跑需要处理：
- `.js` specifier 对应 `.ts` 源文件
- TypeScript ESM 转译
- decorator 与 `emitDecoratorMetadata`
- bare package import 解析
- dev watch 对临时文件的排除

这些问题仅出现在开发期源码直跑链路，不属于 core 的通用运行时职责。

## Goals / Non-Goals
- Goals:
  - 将开发期源码加载兼容逻辑归位到 `@midwayjs/mock`
  - 保持 Vite 与 Rspack dev 插件共享同一套 source loader
  - 使 `@midwayjs/core.loadModule()` 回到标准加载器职责
  - 保持 functional 一体化开发链路在 Node 20 下可用
- Non-Goals:
  - 不改变 functional API 用户侧 DSL
  - 不切换到新的默认 dev runtime（如 `tsx`）
  - 不把传统 `dist` 驱动开发链路改为源码直跑

## Decisions
- Decision: dev source loader 归属 `@midwayjs/mock`
  - 理由：源码直跑是 mock/dev plugin 的开发期行为，不是 core 通用能力。

- Decision: Vite 与 Rspack 通过 `mock.createApp()` 共享同一 source loader
  - 理由：避免两个 dev 入口维护两套 TS/ESM 兼容逻辑。

- Decision: `@midwayjs/core.loadModule()` 只保留标准 `require/import + safeLoad`
  - 理由：恢复 core 边界，减少基础层意外回归。

- Decision: 本次先保留当前兼容策略思路，不立即切换到 `tsx`/`ts-node` 作为默认运行时
  - 理由：历史上完整 TS runtime 在 Midway/Koa 开发链路里存在启动/重建性能成本，本次优先修正边界而非切换 runtime 路线。

## Risks / Trade-offs
- 风险：从 core 挪出 fallback 逻辑后，mock 内部实现复杂度上升。
  - Mitigation: 将 source loader 单独封装，避免散落在 `creator.ts`、`vite.ts`、`rspack.ts` 中。

- 风险：Vite/Rspack watcher 与临时产物处理仍可能产生边缘行为。
  - Mitigation: 在 mock 层补充 watcher 排除与 Node 20 fixture 回归测试。

- 风险：重新归位时可能误伤已有 commonjs/esm 加载路径。
  - Mitigation: 保留 core/mock 定向构建与测试验证，逐步回退 core 逻辑。

## Migration Plan
1. 在 `packages/mock` 引入统一 dev source loader。
2. 让 `mock.createApp()` 在源码入口探测与初始化阶段走 source loader。
3. 让 Vite/Rspack 插件只负责请求桥接与 reload，不再承载源码兼容细节。
4. 将 `core.loadModule()` 回退为纯加载器。
5. 用 Node 20 functional fixture 验证 React/Vue 一体化开发链路。

## Open Questions
- mock source loader 是否以“显式新函数”方式接入，还是通过 `initializeGlobalApplicationContext()` 的可配置 loader hook 接入更合适。
- decorator-heavy 业务在 mock source loader 中是否需要继续保留局部 transpile 策略，还是后续单独评估运行时替换方案。
