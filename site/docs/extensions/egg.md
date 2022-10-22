# EggJS

Midway 可以使用 EggJS 作为上层 Web 框架，EggJS 提供了非常多常用的插件和 API，帮助用户快速构建企业级 Web 应用。本章节内容，主要介绍 EggJS 在 Midway 中如何使用自身的能力。

| 描述              |      |
| ----------------- | ---- |
| 包含独立主框架    | ✅    |
| 包含独立日志      | ✅    |



## 安装依赖

```bash
$ npm i @midwayjs/web@3 egg --save
$ npm i @midwayjs/egg-ts-helper --save-dev
```

针对 EggJS 场景，这些包列举如下。

```json
  "dependencies": {
    "@midwayjs/web": "^3.0.0",
    "@midwayjs/decorator": "^3.0.0",
    "egg": "^2.0.0",
    "egg-scripts": "^2.10.0"
  },
  "devDependencies": {
    "@midwayjs/egg-ts-helper": "^1.0.1",
  },
```

| @midwayjs/web           | **必须**，Midway EggJS 适配层              |
| ----------------------- | ------------------------------------------ |
| @midwayjs/decorator     | **必须**，Midway 系列通用的装饰器包        |
| egg                     | **必须**，EggJS 依赖包，提供定义等其他能力 |
| egg-scripts             | **可选**，EggJS 启动脚本                   |
| @midwayjs/egg-ts-helper | **可选**，EggJS 定义生成工具               |

也可以直接使用脚手架创建示例。

```bash
# npm v6
$ npm init midway --type=egg-v3 my_project

# npm v7
$ npm init midway -- --type=egg-v3 my_project
```



## 开启组件

```typescript
import { Configuration, App } from '@midwayjs/decorator';
import * as web from '@midwayjs/web';
import { join } from 'path';

@Configuration({
  imports: [web],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  @App()
  app: web.Application;

  async onReady() {
		// ...
  }
}

```



## 和默认 EggJS 的不同之处


- 1、从 v3 开始，midway 提供了更多的组件，大部分 egg 内置插件默认禁用
- 2、baseDir 默认调整为 `src` 目录，服务器上为 `dist` 目录
- 3、禁用 egg-logger，全部替换为 @midwayjs/logger，不可切换



整个架构如下:
![](https://cdn.nlark.com/yuque/0/2021/png/501408/1614842824740-fc0c1432-3ace-4f77-b51f-15212984b168.png)


## 目录结构


除了 Midway 提供的目录结构外，EggJS 还有一些特殊的目录结构（不可变），整个结构如下。
```
➜  my_midway_app tree
.
├── src
|   ├── app.ts 										 				## EggJS 扩展 Worker 生命周期文件（可选）
|   ├── agent.ts								   				## EggJS 扩展 Agent 生命周期文件（可选）
|   ├── app																## EggJS 固定的根目录（可选）
|   │   ├── public		 								  	## EggJS 静态托管插件的默认目录（可配）
|   │   |   └── reset.css
|   │   ├── view (可选)										 ## EggJS 模板渲染的默认目录（可配）
|   │   |   └── home.tpl
|   │   └── extend (可选)									 ## EggJS 扩展目录（可配）
|   │       ├── helper.ts (可选)
|   │       ├── request.ts (可选)
|   │       ├── response.ts (可选)
|   │       ├── context.ts (可选)
|   │       ├── application.ts (可选)
|   │       └── agent.ts (可选)
|   │
|   ├── config
|   |   ├── plugin.ts
|   |   ├── config.default.ts
|   │   ├── config.prod.ts
|   |   ├── config.test.ts (可选)
|   |   ├── config.local.ts (可选)
|   |   └── config.unittest.ts (可选)
│   ├── controller								 				## Midway 控制器目录（推荐）
│   ├── service								     				## Midway 服务目录（推荐）
│   └── schedule									 				## Midway 定时器目录（推荐）
│
├── typings                        				## EggJS 定义生成目录
├── test
├── package.json
└── tsconfig.json
```
以上是 EggJS 的目录结构全貌，其中包含了很多 EggJS 特有的目录，有一些在 Midway 体系中已经有相应的能力替代，可以直接替换。整个结构，基本上等价于将 EggJS 的目录结构移动到了 `src` 目录下。


由于 EggJS 是基于约定的框架，整个工程的目录结构是固定的，这里列举一些常用的约定目录。

| `src/app/public/**`  | 用于放置静态资源，可选，具体参见内置插件 [egg-static](https://github.com/eggjs/egg-static)。 |
| --- | --- |
| `src/config/config.{env}.ts` | 用于编写配置文件，具体参见[配置](https://eggjs.org/zh-cn/basics/config.html)。 |
| `src/config/plugin.js` | 用于配置需要加载的插件，具体参见[插件](https://eggjs.org/zh-cn/basics/plugin.html)。 |
| `test/**` | 具体参见[单元测试](https://eggjs.org/zh-cn/core/unittest.html)。 |
| `src/app.js` 和 `src/agent.js` | 用于自定义启动时的初始化工作，可选，具体参见[启动自定义](https://eggjs.org/zh-cn/basics/app-start.html)。关于`agent.js`的作用参见[Agent机制](https://eggjs.org/zh-cn/core/cluster-and-ipc.html#agent-%E6%9C%BA%E5%88%B6)。 |



## 配置定义


Midway 在脚手架中提供了标准的 EggJS 的 TS 配置写法，MidwayConfig 中包括了 egg 中配置的定义和属性提示，结构如下。
```typescript
// src/config/config.default.ts
import { MidwayConfig, MidwayAppInfo } from '@midwayjs/core';

export default (appInfo: MidwayAppInfo) => {
  return {
    // use for cookie sign key, should change to your own and keep security
    keys: appInfo.name + '_xxxx',
    egg: {
      port: 7001,
    },
    // security: {
    //   csrf: false,
    // },
  } as MidwayConfig;
};

```
通过这样返回方法的形式，在运行期会被自动执行，合并进完整的配置对象。


这个函数的参数为 `MidwayAppConfig` 类型，值为以下内容。

| **appInfo** | **说明** |
| --- | --- |
| pkg | package.json |
| name | 应用名，同 pkg.name |
| baseDir | 应用代码的 src （本地开发）或者 dist （上线后）目录 |
| appDir | 应用代码的目录 |
| HOME | 用户目录，如 admin 账户为 /home/admin |
| root | 应用根目录，只有在 local 和 unittest 环境下为 baseDir，其他都为 HOME。 |



:::info
注意，这里的 `baseDir` 和 `appDir` 和 EggJS 应用有所区别。
:::




## 使用 Egg 插件

插件是 EggJS 的特色之一，`@midwayjs/web` 也支持 EggJS 的插件体系，但是在有 Midway 组件的情况下，尽可能优先使用 Midway 组件。


插件一般通过 npm 模块的方式进行复用。
```bash
$ npm i egg-mysql --save
```
然后需要在应用或框架的 `src/config/plugin.js` 中声明开启。


如果有 `export default` ，请写在其中。
```typescript
import { EggPlugin } from 'egg';
export default {
  static: false, // default is true
  mysql: {
    enable: true,
    package: 'egg-mysql'
  }
} as EggPlugin;

```
如果没有 `export default` ，可以直接导出。
```typescript
// src/config/plugin.ts
// 使用 mysql 插件
export const mysql = {
  enable: true,
  package: 'egg-mysql',
};
```


在开启插件之后，我们就可以在业务代码中使用插件提供的功能了。一般来说，插件会将对象挂载到 EggJS 的 `app` 和 `ctx` 之上，然后直接使用。


```typescript
app.mysql.query(sql, values);			// egg 提供的方法
```
在 Midway 中可以通过 `@App` 获取 `app` 对象，以及在请求作用域中通过 `@Inject() ctx` 获取 `ctx` 对象，所以我们可以通过注入来获取插件对象。


```typescript
import { Provide, Inject, Get } from '@midwayjs/decorator';
import { Application, Context } from 'egg';

@Provide()
export class HomeController {

  @App()
  app: Application;

  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
  	this.app.mysql.query(sql, values);    // 调用 app 上的方法（如果有的话）
    this.ctx.mysql.query(sql, values);		// 调用挂载在 ctx 上的方法（如果有的话）
  }
}
```
此外，还可以通过 `@Plugin` 装饰器来直接注入 `app` 挂载的插件，默认情况下，如果不传参数，将以属性名作为 key。


```typescript
import { Provide, Get, Plugin } from '@midwayjs/decorator';

@Provide()
export class HomeController {

  @Plugin()
  mysql: any;

  @Get('/')
  async home() {
  	this.mysql.query(sql, values);
  }
}
```
:::info
`@Plugin() mysql`  等价于 `app.mysql` 。 `@Plugin` 的作用就是从 app 对象上拿对应属性名的插件，所以 `@Plugin() xxx` 就等于 `app['xxx']` 。
:::


## Web 中间件


中间件样例如下：


```typescript
import { Middleware } from '@midwayjs/decorator';
import { IMiddleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/web';

@Middleware()
export class ReportMiddleware implements IMiddleware<Context, NextFunction> {

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const startTime = Date.now();
      await next();
      console.log(Date.now() - startTime);
    };
  }

}
```

:::caution
注意

1、如果要继续使用 EggJS 传统的函数式写法，必须将文件放在 `src/app/middleware` 下

2、egg 自带的内置中间件已经集成

:::

应用中间件。

```typescript
// src/configuration.ts
import { App, Configuration } from '@midwayjs/decorator';
import * as egg from '@midwayjs/web';
import { ReportMiddleware } from './middleware/user.middleware';

@Configuration({
  imports: [egg]
  // ...
})
export class AutoConfiguration {

  @App()
  app: egg.Application;

  async onReady() {
    this.app.useMiddleware(ReportMiddleware);
  }
}

```

更多用法请参考 [Web 中间件](../middleware)



## 中间件顺序

由于 egg 也有自己的中间件逻辑，在新版本中，我们将中间件加载顺序做了一定的处理，执行顺序如下：

- 1、egg 框架中的中间件
- 2、egg 插件通过 config.coreMiddleware 添加的顺序
- 3、业务代码配置在 config.middleware 中配置的顺序
- 4、app.useMiddleware 添加的顺序

因为 midway 的中间件会后置加载，所以我们可以在 onReady 中进行自定义排序。



## BodyParser

egg 自带  `bodyParser` 功能，默认会解析 `Post` 请求，自动识别 `json` 和 `form` 类型。

如需 text 或者 xml，可以自行配置。

默认的大小限制为 `1mb`，可以单独对每项配置大小。

```typescript
// src/config/config.default
export default {
  // ...
  bodyParser: {
    formLimit: '1mb',
    jsonLimit: '1mb',
    textLimit: '1mb',
    xmlLimit: '1mb',
  },
}
```

注意，使用 Postman 做 Post 请求时的类型选择：

![postman](https://img.alicdn.com/imgextra/i4/O1CN01QCdTsN1S347SuzZU5_!!6000000002190-2-tps-1017-690.png)




## 定时任务
v3 开始请参考 [task 组件](./extesion/task) 。

如需兼容之前的 [egg 定时任务](https://eggjs.org/zh-cn/basics/schedule.html) ，请照下列方法。

首先安装 `midway-schedule` 依赖。

```bash
$ npm i midway-schedule --save
```

添加到插件中即可。

```typescript
// src/config/plugin.ts
export default {
  schedule: true,
  schedulePlus: {
    enable: true,
    package: midway-schedule,
  }
}
```

使用请参考上一版本文档。



## 日志

v3 开始无法使用 egg-logger，请参考 [日志](../logger) 章节。



## 异常处理

EggJS 框架通过 [onerror](https://github.com/eggjs/egg-onerror) 插件提供了统一的错误处理机制，会作为 Midway 的兜底错误逻辑，和 [错误过滤器](../error_filter) 不冲突。

对一个请求的所有处理方法（Middleware、Controller、Service）中抛出的任何异常都会被它捕获，并自动根据请求想要获取的类型返回不同类型的错误（基于 [Content Negotiation](https://tools.ietf.org/html/rfc7231#section-5.3.2)）。



| 请求需求的格式 | 环境 | errorPageUrl 是否配置 | 返回内容 |
| --- | --- | --- | --- |
| HTML & TEXT | local & unittest | - | onerror 自带的错误页面，展示详细的错误信息 |
| HTML & TEXT | 其他 | 是 | 重定向到 errorPageUrl |
| HTML & TEXT | 其他 | 否 | onerror 自带的没有错误信息的简单错误页（不推荐） |
| JSON & JSONP | local & unittest | - | JSON 对象或对应的 JSONP 格式响应，带详细的错误信息 |
| JSON & JSONP | 其他 | - | JSON 对象或对应的 JSONP 格式响应，不带详细的错误信息 |




onerror 插件的配置中支持 errorPageUrl 属性，当配置了 errorPageUrl 时，一旦用户请求线上应用的 HTML 页面异常，就会重定向到这个地址。


在 `src/config/config.default.ts` 中
```typescript
// src/config/config.default.ts
module.exports = {
  onerror: {
    // 线上页面发生异常时，重定向到这个页面上
    errorPageUrl: '/50x.html',
  },
};
```



## 扩展 Application/Context/Request/Response


### 增加扩展逻辑


虽然 MidwayJS 并不希望直接将属性挂载到 koa 的 Context，App 上（会造成管理和定义的不确定性），但是 EggJS 的这项功能依旧可用。


文件位置如下。
```
➜  my_midway_app tree
.
├── src
│   ├── app
│   │   └── extend
│   │       ├── application.ts
│   │       ├── context.ts
│   │       ├── request.ts
│   │       └── response.ts
│   ├── config
│   └── interface.ts
├── test
├── package.json
└── tsconfig.json
```
内容和原来的 EggJS 相同。
```typescript
// src/app/extend/context.ts
export default {
  get hello() {
    return 'hello world';
  },
};
```
### 增加扩展定义

Context 请使用 Midway 的方式来扩展，请查看 [扩展上下文定义](https://midwayjs.org/docs/context_definition)。


其余的部分，沿用 egg 的方式，请在 `src/interface.ts` 中扩展。
```typescript
// src/interface.ts
declare module 'egg' {
  interface Request {
    // ...
  }
  interface Response {
    // ...
  }
  interface Application {
    // ...
  }
}
```
:::info
业务自定义扩展的定义请 **不要放在根目录** `typings` 下，避免被 ts-helper 工具覆盖掉。
:::



## 使用 egg-scripts 部署

由于 EggJS 提供了默认的多进程部署工具 `egg-scripts` ，Midway 也继续支持这种方式，如果上层是 EggJS，推荐这种部署方式。

首先在依赖中，确保安装 `egg-scripts` 包。

```bash
$ npm i egg-scripts --save
```



添加 `npm scripts` 到 `package.json`：

在上面的代码构建之后，使用我们的 `start` 和 `stop` 命令即可完成启动和停止。

```json
"scripts": {
    "start": "egg-scripts start --daemon --title=********* --framework=@midwayjs/web",
    "stop": "egg-scripts stop --title=*********",
}
```



:::info

`*********` 的地方是你的项目名。
:::

> 注意：`egg-scripts` 对 Windows 系统的支持有限，参见 [#22](https://github.com/eggjs/egg-scripts/pull/22)。

####

**启动参数**

```bash
$ egg-scripts start --port=7001 --daemon --title=egg-server-showcase
```

Copy

如上示例，支持以下参数：

- `--port=7001` 端口号，默认会读取环境变量 process.env.PORT，如未传递将使用框架内置端口 7001。
- `--daemon` 是否允许在后台模式，无需 nohup。若使用 Docker 建议直接前台运行。
- `--env=prod` 框架运行环境，默认会读取环境变量 process.env.EGG_SERVER_ENV， 如未传递将使用框架内置环境 prod。
- `--workers=2` 框架 worker 线程数，默认会创建和 CPU 核数相当的 app worker 数，可以充分的利用 CPU 资源。
- `--title=egg-server-showcase` 用于方便 ps 进程时 grep 用，默认为 egg-server-${appname}。
- `--framework=yadan` 如果应用使用了[自定义框架](https://eggjs.org/zh-cn/advanced/framework.html)，可以配置 package.json 的 egg.framework 或指定该参数。
- `--ignore-stderr` 忽略启动期的报错。
- `--https.key` 指定 HTTPS 所需密钥文件的完整路径。
- `--https.cert` 指定 HTTPS 所需证书文件的完整路径。
- 所有 [egg-cluster](https://github.com/eggjs/egg-cluster) 的 Options 都支持透传，如 --port 等。

更多参数可查看 [egg-scripts](https://github.com/eggjs/egg-scripts) 和 [egg-cluster](https://github.com/eggjs/egg-cluster) 文档。

:::info

使用 egg-scripts 部署的日志会存放在 **用户目录** 下**，**比如 `/home/xxxx/logs` 。

:::



## 启动环境

原有 egg 使用 `EGG_SERVER_ENV` 中作为环境标志，在 Midway 中请使用 `MIDWAY_SERVER_ENV`。



## 配置

### 默认配置

```typescript
// src/config/config.default
export default {
  // ...
  egg: {
    port: 7001,
  },
}
```

`@midwayjs/web`  所有参数如下：

| 配置项         | 类型             | 描述                         |
| -------------- | ---------------- | ---------------------------- |
| port           | number           | 必填，启动的端口             |
| key            | string           | Buffer                       |
| cert           | string           | Buffer                       |
| ca             | string           | Buffer                       |
| hostname       | string           | 监听的 hostname，默认 127.1  |
| http2          | boolean          | 可选，http2 支持，默认 false |
| queryParseMode | simple\|extended | 默认为 extended              |

以上的属性，对本地和使用 `bootstrap.js` 部署的应用生效。



### 修改端口

:::tip

注意，这个方式只会对本地研发，以及使用 bootstrap.js 文件部署的项目生效。

:::

默认情况下，我们在 `config.default` 提供了 `7001` 的默认端口参数，修改它就可以修改 egg http 服务的默认端口。

比如我们修改为 `6001`：

```typescript
// src/config/config.default
export default {
  // ...
  egg: {
    port: 6001,
  },
}
```

默认情况下，单测环境由于需要 supertest 来启动端口，我们的 port 配置为 `null`。

```typescript
// src/config/config.unittest
export default {
  // ...
  egg: {
    port: null,
  },
}
```

此外，也可以通过 `midway-bin dev --ts --port=6001` 的方式来临时修改端口，此方法会覆盖配置中的端口。



### 全局前缀

此功能请参考 [全局前缀](../controller#全局路由前缀)。



### Https 配置

在大多数的情况，请尽可能使用外部代理的方式来完成 Https 的实现，比如 Nginx。

在一些特殊场景下，你可以通过配置 SSL 证书（TLS 证书）的方式，来直接开启 Https。

首先，你需要提前准备好证书文件，比如 `ssl.key` 和 `ssl.pem`，key 为服务端私钥，pem 为对应的证书。

然后配置即可。

```typescript
// src/config/config.default
import { readFileSync } from 'fs';
import { join } from 'path';

export default {
  // ...
  egg: {
    key: join(__dirname, '../ssl/ssl.key'),
    cert: join(__dirname, '../ssl/ssl.pem'),
  },
}
```



### favicon 设置

默认情况下，浏览器会发起一个 `favicon.ico` 的请求。

```typescript
// src/config/config.default
import { readFileSync } from 'fs';
import { join } from 'path';

export default {
  // ...
  siteFile: {
    '/favicon.ico': readFileSync(join(__dirname, 'favicon.png')),
  },
}
```



如果开启了 `@midwayjs/static-file` 组件，那么会优先使用组件的静态文件托管。

### 修改上下文日志

可以单独修改 egg 框架的上下文日志。

```typescript
export default {
  egg: {
    contextLoggerFormat: info => {
      const ctx = info.ctx;
      return `${info.timestamp} ${info.LEVEL} ${info.pid} [${ctx.userId} - ${Date.now() - ctx.startTime}ms ${ctx.method}] ${info.message}`;
    }
    // ...
  },
};
```



### Query 数组解析

默认情况下，`ctx.query` 会解析为忽略数组的情况，而 `ctx.queries` 会严格的将所有的字段都变成数组。

如果调整 `queryParseMode` ，则可以使 `ctx.query` 变为两者之间的结构（querystring 的结果）。

```typescript
// src/config/config.default
export default {
  // ...
  egg: {
    // ...
    queryParseMode: 'simple',
  },
}
```




## 常见问题
### 1、生成 ts 定义


Midway 提供了 `@midwayjs/egg-ts-hepler` 工具包，用于快速生成 EggJS 开发时所依赖的定义。
```bash
$ npm install @midwayjs/egg-ts-helper --save-dev
```
在 `package.json` 中加入对应的 `ets` 命令即可，一般来说，我们会在 dev 命令前加入，以保证代码的正确性。
```json
  "scripts": {
    "dev": "cross-env ets && cross-env NODE_ENV=local midway-bin dev --ts",
  },
```
:::info
在第一次编写代码前，需要执行一次此命令才能有 ts 定义生成。
:::


EggJS 生成的定义在 `typings` 目录中。
```
➜  my_midway_app tree
.
├── src                            ## midway 项目源码
├── typings                        ## EggJS 定义生成目录
├── test
├── package.json
└── tsconfig.json
```


### 2、EggJS 中 Configuration 的特殊情况


在 EggJS 下， `configuration.ts`  中的生命周期**只会在 worker 下加载执行**。如果在 Agent 有类似的需求，请直接使用 EggJS 自身的 `agent.ts` 处理。



### 3、异步初始化配置无法覆盖插件配置

`onConfigLoad` 生命周期会在 egg 插件（若有）初始化之后执行，所以不能用于覆盖 egg 插件所使用的配置。



### 4、默认的 csrf 错误


在 post 请求，特别是第一次时用户会发现一个 csrf 报错。原因是 egg 在框架中默认内置了安全插件 [egg-security](https://github.com/eggjs/egg-security)， 默认开启了  csrf 校验。


我们可以在配置中关闭它，但是更好的是去[**了解它**](https://eggjs.org/zh-cn/core/security.html#%E5%AE%89%E5%85%A8%E5%A8%81%E8%83%81-csrf-%E7%9A%84%E9%98%B2%E8%8C%83)之后再做选择。

```typescript
export const security = {
  csrf: false,
};
```




### 5、不存在定义的问题

一些 egg 插件未提供 ts 定义，导致使用会出现未声明方法的情况，比如 egg-mysql。
![image.png](https://img.alicdn.com/imgextra/i1/O1CN01mv68zG1zN6nALff8n_!!6000000006701-2-tps-1478-876.png)
可以使用 any 绕过。

```typescript
await (this.app as any).mysql.query(sql);
```

或者可以自行增加扩展定义。

