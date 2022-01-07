---
title: Koa
---

Koa 是一个非常轻量易用的 Web 框架。
​

本章节内容，主要介绍在 Midway 中如何使用 Koa 作为上层框架，并使用自身的能力。

## 创建项目

我们可以使用我们的脚手架来创建一个模版项目：

```bash
$ npm -v

# 如果是 npm v6
$ npm init midway --type=koa hello_koa

# 如果是 npm v7
$ npm init midway -- --type=koa hello_koa
```

运行：

```bash
cd hello_koa 	// 进入项目路径
npm run dev		// 本地运行
```

针对 Koa，Midway 提供了 `@midwayjs/koa` 包进行了适配，在其中提供了 Midway 特有的依赖注入、切面等能力。

这些包列举如下。

```json
  "dependencies": {
    "@midwayjs/koa": "^2.3.11",
    "@midwayjs/decorator": "^2.3.11"
  },
  "devDependencies": {
    "@midwayjs/mock": "^2.3.11",
  },
```

| @midwayjs/koa       | Midway 针对 Koa 的适配层  |
| ------------------- | ------------------------- |
| @midwayjs/decorator | Midway 系列通用的装饰器包 |
| @midwayjs/mock      | 本地开发工具包            |

`@midwayjs/koa` 包默认使用 `koa@2` 以及集成了 `@koa/router` 作为路由基础能力。

## 目录结构

```
.
├── src
│   ├── controller								 				# controller 接口的地方
│   └── service									 					# service 逻辑处理的地方
|   └── configuration.ts									# 入口及生命周期配置、组件管理
├── test
├── package.json
└── tsconfig.json
```

## 控制器（Controller）

整个请求接口的写法和 Midway 适配其他框架的相同，只是定义有少许差异。

```typescript
import { Inject, Controller, Get, Provide, Query } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

@Provide()
@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home(@Query() id) {
    // this.ctx.query.id === id
  }
}
```

### 请求参数装饰器

在 @midwayjs/koa 中，可以使用大部分的请求装饰器，具体的列表如下：

| @Query       | √                              |
| ------------ | ------------------------------ |
| @Body        | 需要自行安装 body 解析库后使用 |
| @Param       | √                              |
| @Headers     | √                              |
| @Session     | 需要自行安装 session 后使用    |
| @RequestPath | √                              |
| @RequestIP   | √                              |
| @Queries     | 同 @Query                      |

由于 koa 框架相对纯粹，默认情况下，我们没有埋入 body 解析的库。 `@Body`  装饰器将在安装了解析 body 库之后才能使用。

比如下面就是如何引入 `koa-bodyparser`  的代码（示例项目已包含）：

```typescript
import { Configuration, App } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import { Application } from '@midwayjs/koa';
import * as bodyParser from 'koa-bodyparser';

@Configuration()
export class ContainerLifeCycle implements ILifeCycle {
  @App()
  app: Application;

  async onReady() {
    // bodyparser options see https://github.com/koajs/bodyparser
    this.app.use(bodyParser());
  }
}
```

同理， `@Session`  装饰也需要自行安装 `koa-session`  库。

```typescript
import { Configuration, App } from '@midwayjs/decorator';
import * as bodyParser from 'koa-bodyparser';
import * as session from 'koa-session';

@Configuration({
  importConfigs: ['./config'],
})
export class ContainerConfiguration {
  @App()
  app;

  async onReady() {
    this.app.keys = ['some secret hurr'];

    this.app.use(
      session(
        {
          key: 'koa.sess',
          maxAge: 86400000,
          httpOnly: true,
        },
        this.app
      )
    );
    this.app.use(bodyParser());
  }
}
```

## 编写 Web 中间件

创建一个 `src/middleware/report.ts` 。我们在这个 Web 中间件中打印了控制器（Controller）执行的时间。

```
➜  my_midway_app tree
.
├── src
│   ├── controller
│   │   └── home.ts
│   ├── interface.ts
│   ├── middleware                   ## 中间件目录
│   │   └── report.ts
│   └── service
│       └── user.ts
├── test
├── package.json
└── tsconfig.json
```

简单来说， `await next()` 则代表了下一个要执行的逻辑，这里一般代表控制器执行，在执行的前后，我们可以进行一些打印和赋值操作，这也是洋葱圈模型最大的优势。

```typescript
import { Provide } from '@midwayjs/decorator';
import { IWebMiddleware, IMidwayKoaContext, IMidwayKoaNext } from '@midwayjs/koa';

@Provide()
export class ReportMiddleware implements IWebMiddleware {
  resolve() {
    return async (ctx: IMidwayKoaContext, next: IMidwayKoaNext) => {
      const startTime = Date.now();
      await next();
      console.log(Date.now() - startTime);
    };
  }
}
```

注意，这里我们导出了一个 `ReportMiddleware` 类，这个中间件类的 key 为 `reportMiddleware` 。

## 路由中间件

我们可以把上面编写的中间件应用到单个 Controller 上，也可以将中间件应用到单个路由上。

```typescript
import { Controller, Get, Provide } from '@midwayjs/decorator';

@Provide()
@Controller('/', { middleware: ['reportMiddleware'] }) // controller 级别的中间件
export class HomeController {
  @Get('/', { middleware: ['reportMiddleware'] }) // 路由级别的中间件
  async home() {}
}
```

## 全局中间件

直接使用 Midway 提供的 `app.generateMiddleware` 方法，在入口处加载全局中间件。

```typescript
// src/configuration.ts
import { Configuration, App } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import { Application } from '@midwayjs/koa';

@Configuration()
export class ContainerLifeCycle implements ILifeCycle {
  @App()
  app: Application;

  async onReady() {
    this.app.use(await this.app.generateMiddleware('reportMiddleware'));
  }
}
```

除了加载 Class 形式的中间件外，也支持加载传统的 koa 中间件。

我们以加载一个三方中间件（koa-static）举例。

```typescript
// src/configuration.ts
import { Configuration, App } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import { Application } from '@midwayjs/koa';
import { join } from 'path';

@Configuration()
export class ContainerLifeCycle implements ILifeCycle {
  @App()
  app: Application;

  async onReady() {
    const root = join(__dirname, 'public');
    this.app.use(require('koa-static')(root, {}));
  }
}
```

你可以通过注入 `app` 对象，来调用到所有 koa 上的方法。

## 框架启动参数

`@midwayjs/koa`  框架的启动参数如下：

| port     | number  | 必填，启动的端口             |
| -------- | ------- | ---------------------------- | ------------ | ------- | --------------------- |
| key      | string  | Buffer                       | Array<Buffer | Object> | 可选，HTTPS 证书 key  |
| cert     | string  | Buffer                       | Array<Buffer | Object> | 可选，HTTPS 证书 cert |
| ca       | string  | Buffer                       | Array<Buffer | Object> | 可选，HTTPS 证书 ca   |
| hostname | string  | 监听的 hostname，默认 127.1  |
| http2    | boolean | 可选，http2 支持，默认 false |

## 部署

### 部署到普通应用容器

Midway 构建出来的项目是单进程的，不管是采用 `fork` 模式还是 `cluster` 模式，单进程的代码总是很容易的兼容到不同的体系中，因此非常容易被社区现有的 pm2/forever 等工具所加载，

我们这里以 pm2 来演示如何部署。

项目一般都需要一个入口文件，比如，我们在根目录创建一个 `bootstrap.js` 作为我们的部署文件。

```
➜  hello_koa tree
.
├── src
├── dist                # Midway 构建产物目录
├── test
├── server.js						# 部署启动文件
├── package.json
└── tsconfig.json
```

Midway 提供了一个简单方式以满足不同场景的启动方式，只需要安装我们提供的 `@midwayjs/bootstrap` 模块。

```bash
$ npm install @midwayjs/bootstrap --save
```

然后在入口文件中写入代码，注意，这里的代码使用的是 `JavaScript` 。

```javascript
// 获取框架
const WebFramework = require('@midwayjs/koa').Framework;
// 初始化 web 框架并传入启动参数
const web = new WebFramework().configure({
  port: 7001,
});

const { Bootstrap } = require('@midwayjs/bootstrap');

// 加载框架并执行
Bootstrap.load(web).run();
```

我们提供的每个上层框架都将会导出一个 `Framework` 类，而 `Bootstrap` 的作用则是加载这些框架，传入启动参数，运行他们。

这个时候，你已经可以直接使用 `node bootstrap.js` 来启动代码了，也可以使用 pm2 来执行启动。

```bash
$ npm install -g pm2
$ pm2 start bootstrap.js
```

### 部署到 Serverless 环境

Serverless 环境指的是阿里云 FC，腾讯云等函数环境。Midway 可以将现有的 Web 项目部署为 Serverless 应用，这里以部署到阿里云函数计算作为示例。
​

1、添加 `f.yml` 文件到你的项目根目录。

```
➜  hello_koa tree
.
├── src
├── dist
├── f.yml  								# Midway Serverless 部署配置文件
├── package.json
└── tsconfig.json
```

```yaml
service: my-midway-app ## 应用发布到云平台的名字，一般指应用名

provider:
  name: aliyun ## 发布的云平台，aliyun，tencent 等

deployType: koa ## 部署的应用类型
```

2、代码修改

将 `bootstrap.js`  重命名为 `app.js` ，移除内部的端口（Serverless 环境不需要），并返回一个 app。

修改后的代码如下：

```typescript
// 获取框架
const WebFramework = require('@midwayjs/koa').Framework;
// 初始化 web 框架并传入启动参数
const web = new WebFramework().configure({});
const { Bootstrap } = require('@midwayjs/bootstrap');

module.exports = async () => {
  // 加载框架并执行
  await Bootstrap.load(web).run();
  // 返回 app 对象
  return web.getApplication();
};
```

3、添加发布时的构建钩子

在 `package.json` 加入下面的这段，用于在发布时自动执行 `npm run build` 。

```json
  "midway-integration": {
    "lifecycle": {
      "before:package:cleanup": "npm run build"
    }
  },
	"scripts": {
  	"deploy": "midway-bin deploy"
  }
```

3、执行 `npm run deploy` 即可，发布后，阿里云会输出一个临时可用的域名，打开浏览器访问即可。

<img src="https://cdn.nlark.com/yuque/0/2020/png/501408/1600835297676-1753de7a-fb0d-46ca-98f0-944eba5b2f2b.png#height=193&id=XpZAN&margin=%5Bobject%20Object%5D&name=image.png&originHeight=193&originWidth=1219&originalType=binary&ratio=1&size=35152&status=done&style=none&width=1219" width="1219" />

如需更详细的发布文档，请查阅 [**Serverless 发布 FAQ**](https://www.yuque.com/midwayjs/faas/deploy_aliyun_faq)。
