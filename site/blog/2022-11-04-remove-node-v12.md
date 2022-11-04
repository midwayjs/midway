---
slug: remove-node-v12
title: 移除 node v12 相关的依赖
authors: [harry]
tags: [node]

---

由于最近 node v18 标记为 LTS，社区相关的相关的依赖都移除了 node v12 的支持，导致 Midway 的基建，单测已经无法正常的执行。

虽然 Midway 框架本身支持在 Node v12 下运行，但是例如 jest 等工具的最新版本已经无法执行。经过内部讨论后决定，在 Github Action 中移除 Midway 以及相关库的 Node v12 的单测，为此，相关的依赖会进行调整，包括：

- 1、脚手架的变更
  - `@midwayjs/cli` 升级为 `^2.0.0`
  - `jest` ，`@types/jest`，`ts-jest` 升级为 v29 版本
  - typescript 升级为 `4.8.x`
- 2、Midway 本身
  - 移除 node v12 的 github action 执行
  - 鉴于部分环境的情况，继续经验支持 node v12 的运行，有 node v12 的问题可以 issue 提问



依赖的变更可以参考：

```json
"devDependencies": {
  "@midwayjs/cli": "^2.0.0",
  "@types/jest": "^29.2.0",
  "jest": "^29.2.2",
  "ts-jest": "^29.0.3",
  "typescript": "~4.8.0"
}
```

