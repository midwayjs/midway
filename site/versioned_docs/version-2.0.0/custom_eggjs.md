---
title: 自定义 EggJS 框架接入
---

在 Midway 体系中，我们通过 `@midwayjs/web` ，支持了 EggJS 作为上层框架，并将 Web 层传统的控制器、服务等分层，以及依赖注入带到了 EggJS 体系。

在社区中，有不少公司已经基于 EggJS 封装了自己的插件和框架，如果这个时候基于 MidwayJS 需要重写原有的框架体系，就显得很不切实际。为此，Midway 开发了一套让 EggJS 上层框架快速接入 Midway 体系，使用到 Midway 依赖注入能力的方式。

## 上层框架要求

我们以一个名为 `fake-egg`  的上层框架举例。

EggJS 的上层框架，按照文档会有一些要求，会导出一些固定的属性，比如 `Application` 、 `Agent` 、 `AppWorkerLoader`  以及 `AgentWorkerLoader`  这四个属性，**这四个属性必须导出**，示例如下。

```typescript
'use strict';

const egg = require('egg');

const framework = {};

/**
 * @member {Application} Egg#Application
 * @since 1.0.0
 */
framework.Application = require('./lib/application');

/**
 * @member {Agent} Egg#Agent
 * @since 1.0.0
 */
framework.Agent = require('./lib/agent');

/**
 * @member {Agent} Egg#AppWorkerLoader
 * @since 1.0.0
 */
framework.AppWorkerLoader = require('./lib/core/loader/app_worker_loader');

/**
 * @member {Agent} Egg#AgentWorkerLoader
 * @since 1.0.0
 */
framework.AgentWorkerLoader = require('./lib/core/loader/agent_worker_loader');

module.exports = exports = Object.assign(egg, framework);
```

## 接入 MidwayJS

接入 MidwayJS 的方式很简单。只需要沿用 EggJS 的自定义框架接入方式，在实际业务的 `package.json`  中增加字段即可。

```json
{
  "name": "ali-demo",
  "egg": {
    "framework": "fake-egg"
  }
}
```

这样， `@midwayjs/web`  会自动加载该框架，并将其作为基础的上层框架增加依赖注入，装饰器等能力。这样既可以享受到该上层框架的 EggJS 扩展能力，又能使用现有的 Midway 体系的能力。

扩展之后，整个目录结构会沿用 Midway 体系，并将 EggJS 默认的 baseDir 修改为 `src`  中。

完整的用户的 `package.json`  如下。

```json
{
  "name": "{{name}}",
  "private": true,
  "dependencies": {
    "@midwayjs/web": "^2.3.0",
    "@midwayjs/decorator": "^2.3.0",
    "fake-egg": "^1.0.0",												// 这里增加了上层框架
    "egg": "^2.0.0",
    "egg-scripts": "^2.10.0",
    "midway": "^2.3.0"
  },
  "devDependencies": {
    ...																					// 开发依赖没有变化
  },
  "egg": {
    "framework": "fake-egg"											// 额外增加一个配置指定上层框架
  }
}
```

其他关于如何实现一个 EggJS 自定义框架，请参考 [EggJS 文档](https://eggjs.org/zh-cn/advanced/framework.html)。
