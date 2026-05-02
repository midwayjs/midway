## 1. Design
- [x] 1.1 明确 `@midwayjs/core` 与 `@midwayjs/mock` 在开发期源码加载中的职责边界
- [x] 1.2 设计 `mock` 内部共享 dev source loader，覆盖 Vite 与 Rspack 两条开发链路

## 2. Implementation
- [x] 2.1 在 `packages/mock` 中实现 dev source loader，并封装 ESM + TypeScript + decorator 开发期兼容逻辑
- [x] 2.2 调整 `packages/mock/src/creator.ts`，在源码入口探测与应用初始化阶段使用 mock source loader
- [x] 2.3 调整 `packages/mock/src/vite.ts` 与 `packages/mock/src/rspack.ts` 以复用统一 source loader，并维持 watcher 行为稳定
- [x] 2.4 将 `packages/core/src/util/index.ts` 回退为标准模块加载实现，移除 dev-only fallback/临时文件逻辑

## 3. Validation
- [x] 3.1 为 `@midwayjs/mock` 新增 Node 20 + ESM + TypeScript + decorator fixture 回归测试
- [x] 3.2 验证 Vite functional dev 场景在 Node 20 下可启动且不会因临时文件造成重复 reload
- [x] 3.3 运行 `pnpm -C packages/core build`
- [x] 3.4 运行 `pnpm -C packages/mock build`
- [x] 3.5 运行相关 mock/core 定向测试
- [x] 3.6 运行 `openspec validate refactor-functional-dev-source-loader-boundary --strict --no-interactive`
