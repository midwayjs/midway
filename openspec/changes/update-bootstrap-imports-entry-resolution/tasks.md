## 1. Implementation

- [x] 1.1 在 core 中统一标准化 `IMidwayBootstrapOptions.imports` 的单模块与数组输入
- [x] 1.2 调整异步应用上下文准备流程，仅在 `imports` 未传时探测默认项目入口
- [x] 1.3 调整同步应用上下文准备流程，使其与异步流程保持相同语义
- [x] 1.4 为 `IMidwayBootstrapOptions.imports` 补充覆盖语义的接口注释
- [x] 1.5 迁移 `@midwayjs/mock` 的应用与 FaaS 入口组合，保留额外测试组件的 additive imports 契约

## 2. Tests

- [x] 2.1 验证未传 `imports` 时加载默认 Configuration
- [x] 2.2 验证显式数组和单模块输入不会追加默认 Configuration
- [x] 2.3 验证 `imports: []` 不加载默认 Configuration
- [x] 2.4 验证同步和异步初始化路径行为一致
- [x] 2.5 验证 mock 驱动的 Functional API samples 在有无额外 imports 时均可加载默认 Configuration
- [x] 2.6 验证 mock 驱动的 FaaS fixture 可同时加载额外组件与默认 Configuration

## 3. Documentation And Validation

- [x] 3.1 更新 Bootstrap 配置文档和 5.x 迁移说明
- [x] 3.2 运行 core 定向测试、构建和 lint
- [x] 3.3 运行 OpenSpec 严格校验
