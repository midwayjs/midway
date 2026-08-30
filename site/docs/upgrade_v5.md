# 4.x 升级指南

本篇介绍从 Midway v4 升级到 Midway v5 时需要关注的 Breaking Change。

## Bootstrap imports 覆盖默认入口

在 Midway v4 中，即使通过 `Bootstrap.configure()` 显式传入 `imports`，Bootstrap 仍会自动追加 `baseDir` 下的默认 `configuration` 或 `index` 入口。

Midway v5 调整为更明确的覆盖语义：

- 不传 `imports` 时，继续自动加载默认项目入口。
- 显式传入 `imports` 时，只加载传入的模块。
- 传入 `imports: []` 时，不加载任何项目入口。
- `imports` 可以传入单个模块或模块数组。

下面的代码在 v5 中只会加载 `configuration.worker`，适合按进程类型切换 Configuration 或主框架。

```javascript
const { Bootstrap } = require('@midwayjs/bootstrap');

Bootstrap.configure({
  imports: require('./dist/configuration.worker'),
}).run();
```

如果 v4 应用依赖“显式 imports + 自动默认入口”的旧行为，需要在升级后把默认入口也显式加入数组。

```diff
 const { Bootstrap } = require('@midwayjs/bootstrap');
+const defaultConfiguration = require('./dist/configuration');
 const workerConfiguration = require('./dist/configuration.worker');

 Bootstrap.configure({
-  imports: [workerConfiguration],
+  imports: [workerConfiguration, defaultConfiguration],
 }).run();
```

没有配置 `imports` 的应用不需要修改。
