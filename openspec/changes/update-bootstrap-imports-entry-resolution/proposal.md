# Change: Update Bootstrap Imports Entry Resolution

## Why
`Bootstrap.configure({ imports })` 当前会在用户显式传入模块之后，继续自动追加 `baseDir` 下探测到的 `configuration.ts` 或 `configuration.js`。这使 `imports` 无法真正覆盖默认入口，也会在用户尝试按运行场景切换不同 Configuration 或框架时意外加载默认框架。

5.x 可以借助主版本升级明确这项配置的覆盖语义：未传 `imports` 时保持约定式入口探测，显式传入时则只加载用户指定的模块。

## What Changes
- **BREAKING** 调整 `IMidwayBootstrapOptions.imports` 的入口解析语义。
- 当 `imports` 为 `undefined` 时，继续自动探测并加载项目默认入口。
- 当 `imports` 被显式传入时，只加载传入的模块，不再追加项目默认入口。
- 支持单个模块、模块数组和空数组；其中空数组明确表示不加载任何项目入口。
- 保证同步和异步应用上下文初始化路径使用相同规则。
- 迁移 `@midwayjs/mock` 的 `createApp()` 和 `createFunctionApp()` 内部入口组合，使其按照既有契约把 `options.imports` 作为额外测试组件，并显式加入项目默认入口。
- 补充 4.x 到 5.x 的迁移说明，提示依赖“显式 imports + 自动默认入口”行为的应用手动加入默认入口。

## Impact
- Affected specs: `bootstrap-entry-loading`（新增）
- Affected code:
  - `packages/core/src/setup.ts`
  - `packages/core/src/interface.ts`
  - `packages/core/test/setup.test.ts`
  - `packages/mock/src/creator.ts`
  - Functional API sample smoke tests
  - Bootstrap 相关用户文档和 5.x 迁移文档
