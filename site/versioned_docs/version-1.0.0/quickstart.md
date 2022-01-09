---
title: 快速上手
---

### 安装 Node 环境

可以访问 Node.js 官网或者使用 nvm 等类似产品，不再赘述。

### 创建新应用

使用 [midway-init](https://www.npmjs.com/package/midway-init) 工具自动创建 midway 应用的目录结构:

```bash
$ npm i midway-init -g
$ midway-init
```

通过生成的 `npm scripts` 来驱动启动命令:

```bash
$ npm install
$ npm run dev
```

### 了解目录结构

midway 的目录和 eggjs 目录非常接近，但也有所区别，不同的地方在于：

- ts 源码存放于 `/src` 目录下，编译后代码存放于 `/dist` 下
- 以往的 app 等都迁移至 `/src/app` 下，作为 web 层
- 传统的业务逻辑等，移动到其他目录，比如 `/service`

```
➜  midway6-test tree -I node_modules
.
├── README.md
├── README.zh-CN.md
├── dist                                ---- 编译后目录
├── logs                                ---- 本地日志目录
│   └── midway6-test                    ---- 日志应用名开头
│       ├── common-error.log            ---- 错误日志
│       ├── midway-agent.log            ---- agent 输出的日志
│       ├── midway-core.log             ---- 框架输出的日志
│       ├── midway-web.log              ---- koa 输出的日志
│       └── midway6-test-web.log
├── package.json
├── src                                 ---- 源码目录
│   ├── app                             ---- web 层目录
│   │   ├── controller                  ---- web 层 controller 目录
│   │   │   ├── home.ts
│   │   │   └── user.ts
│   │   ├── middleware (可选)            ---- web 层中间件目录
│   │   │   └── trace.ts
│   │   ├── public (可选)                ---- web 层静态文件目录，可以配置
│   │   ├── view (可选)
│   │   |   └── home.tpl                ---- web 层模板
│   ├── config
│   │   ├── config.default.ts
│   │   ├── config.local.ts
│   │   ├── config.prod.ts
│   │   ├── config.unittest.ts
│   │   └── plugin.ts
│   └── service                         ---- 业务逻辑层目录，自由定义
│   │   └── user.ts                     ---- 业务逻辑层，自由定义
│   ├── interface.ts                    ---- 接口定义文件，自由定义
│   ├── app.ts                          ---- 应用扩展文件，可选
│   └── agent.ts                        ---- agent 扩展文件，可选
├── test
│   └── app
│       └── controller
│           └── home.test.ts
├── tsconfig.json
└── tslint.json
```

如上，由框架约定的目录，Midway 使用 EggJs 作为 Web 层容器，承载请求控制器和传统 MVC 层的工作，这一块由于受到限制，有着一定的目录约定：

- `src/app/router.ts` 可选，用于配置 URL 路由规则，具体参见 [Router](https://eggjs.org/zh-cn/basics/router.html)。
- `src/app/controller/**` 用于解析用户的输入，处理后返回相应的结果，具体参见 [Controller](hController)。
- `src/app/middleware/**` 可选，用于编写中间件，具体参见 [Middleware](https://eggjs.org/zh-cn/basics/middleware.html)。
- `src/app/extend/**` 可选，用于框架的扩展，具体参见[框架扩展](https://eggjs.org/zh-cn/basics/extend.html)。
- `src/config/config.{env}.ts` 用于编写配置文件，具体参见[配置](https://eggjs.org/zh-cn/basics/config.html)。
- `src/config/plugin.ts` 用于配置需要加载的插件，具体参见[插件](https://eggjs.org/zh-cn/basics/plugin.html)。
- `test/**` 用于单元测试，具体参见[单元测试](https://eggjs.org/zh-cn/core/unittest.html)。
- `src/app.ts` 和 `agent.ts` 用于自定义启动时的初始化工作，可选，具体参见[启动自定义](https://eggjs.org/zh-cn/basics/app-start.html)。关于`agent.js`的作用参见[Agent 机制](https://eggjs.org/zh-cn/core/cluster-and-ipc.html#agent-%E6%9C%BA%E5%88%B6)。

而其他由于 Egg 插件的限制，可能有些目录也会有相应的约定，比如：

- `src/app/public/**` 用于放置静态资源，可选，具体参见内置插件 [egg-static](https://github.com/eggjs/egg-static)。
- `src/app/view/**` 用于放置模板文件，可选，由模板插件约定，具体参见[模板渲染](https://eggjs.org/zh-cn/core/view.html)。

我们会发现常见的代码都会存放于 `/src` 目录下，由于 ts 的特殊性，在服务器上会通过打包构建为 `*.js` 文件存放于 `/dist` 目录。将源文件和编译后文件分开是我们最开始的初衷。

而除了 app 目录以外的其他目录，在 midway 体系下并没有严格的规定，大体可以按照逻辑分层，比如按照传统的 `web, biz, service, manager, dao` 等进行分层进行创建目录就非常不错。

::: tip
由于 Midway 采用了自动扫描装配，依赖注入等特性，无需在特定的目录下受到限制，使得在全栈应用开发的时候，保持了不错的开发体验。
:::

## 快速开发引导

想要快速上手 midway，除了需要了解一些基础的东西：

- 虽然可以直接用 js 的语法书写，但是你最好了解 TypeScript，这里有个 [快速介绍](ts_start.md)。
- 尽可能使用面向对象的思想来编码，它的经久不衰是有道理的，使用 class 机制能够方便的融入我们的新特性。
- 了解 midway 的依赖注入体系，以及常用的装饰器，这里做了 [依赖注入的介绍](ioc.md)。
- 如果你在 midway 的文档中没有找到你想要的东西，记住可以去 [Egg 的文档找找](https://eggjs.org/zh-cn/intro/)，或者 [向我们提 Issue](https://github.com/midwayjs/midway/issues)。

## 和 Egg 体系相同的部分

这部分的内容和 Egg 体系基本是相同的，大体不同的是后缀的区别 `*.ts`，以及根目录（midway 的根目录在 src)。

### 运行环境

目前没有做特殊处理，完全一样，查看[运行环境文档](https://eggjs.org/zh-cn/basics/env.html)。

### 配置

框架支持根据环境来加载配置，定义多个环境的配置文件，唯一不同的是后缀的区别，具体环境请查看[运行环境配置](https://eggjs.org/zh-cn/basics/env.html)

```
src/config
|- config.default.ts
|- config.prod.ts
|- config.unittest.ts
`- config.local.ts
```

### Web 中间件

除了目录在 `src/app/middleware` 以及后缀名为 `*.ts` ，其余完全一样，查看[中间件文档](https://eggjs.org/zh-cn/basics/middleware.html)。

### Router 路由

`src/app/router.ts` 文件依旧可用，推荐使用 midway 体系的 [路由装饰器](#%E8%B7%AF%E7%94%B1%E8%A3%85%E9%A5%B0%E5%99%A8)，egg 的路由文档在[这里](https://eggjs.org/zh-cn/basics/router.html)。

### 框架扩展

针对框架自身的扩展点，依旧保留可用，目录变为 `src/app/*.ts`，文档查看 [框架扩展](https://eggjs.org/zh-cn/basics/extend.html)。

### 启动自定义

启动自定义依旧保留可用，目录变为 `src/app.ts`，文档查看 [启动自定义](https://eggjs.org/zh-cn/basics/app-start.html)。

如果想在 `app.ts` 中调用 IoC 中的对象，可以通过以下方法。

```typescript
// app.js
module.exports = (app) => {
  app.beforeStart(async () => {
    // 从全局作用域拿单例对象
    const obj = await app.applicationContext.getAsync('xxx');

    // 从请求作用域拿对象
    const ctx = app.createAnonymousContext();
    const obj = await ctx.requestContext.getAsync('xxx');
  });
};
```
