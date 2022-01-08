---
title: midwayjs/egg-ts-helper
---

针对 midway 支持 Egg.js 的场景，重写了原 [egg-ts-helper](https://github.com/whxaxes/egg-ts-helper) 包，移除了原有的 TS，AST 分析等大依赖。

原来的包依赖的 ts v3 环境，依赖 egg 的目录结构，考虑非常多的可能性，在 midway 的场景中不会使用到。基于上述考虑 midway 将此包进行了重写，用最简单的方式提供 egg 定义。

[@midwayjs/egg-ts-helper](https://github.com/midwayjs/egg-ts-helper) 包提供 `ets` 全局命令。

```bash
$ npm i @midwayjs/egg-ts-helper --save-dev
$ ets
```

一般我们会在开发命令里加入。

```json
  "scripts": {
    "dev": "cross-env ets && cross-env NODE_ENV=local midway-bin dev --ts",
  },
```

:::info
此包是针对 midway 定制的，只能用于新版本 midway 及其配套代码。
:::

最终会在项目根目录生成 `typings` 目录，其定义结构和文件如下：

```
.
├── ...
└── typings
    ├── extend
    │		├── request.d.ts
    │		├── response.d.ts
    │		├── application.d.ts
    │   └── context.d.ts
    ├── app
    │   └── index.d.ts
    └── config
        ├── index.d.ts
        └── plugin.d.ts
```

:::caution
注意，该模块只是将 midway v2（Egg.js）的框架 + 插件定义聚合到一起，让当前的业务代码能够顺利的读取到框架和插件的定义，不支持生成业务代码本身的定义，也不支持在开发 egg 插件时生成定义。
:::
