# EggJS

Midway 可以使用 EggJS 作为上层 Web 框架，EggJS 提供了非常多常用的插件和 API，帮助用户快速构建企业级 Web 应用。本章节内容，主要介绍 EggJS 在 Midway 中如何使用自身的能力。

:::tip
Egg.js 的文档调整进行中，请等待完成后再使用。
:::



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

| @midwayjs/web           | **必须**，Midway EggJS 适配层                      |
| ----------------------- | -------------------------------------------------- |
| @midwayjs/decorator     | **必须**，Midway 系列通用的装饰器包                |
| midway                  | **可选**，Midway 启动适配包，提供了 midway v1 兼容 |
| egg                     | **必须**，EggJS 依赖包，提供定义等其他能力         |
| egg-scripts             | **可选**，EggJS 启动脚本                           |
| @midwayjs/egg-ts-helper | **可选**，EggJS 定义生成工具                       |

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
export class ContainerLifeCycle {
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
![image.png](https://cdn.nlark.com/yuque/0/2021/png/501408/1614842824740-fc0c1432-3ace-4f77-b51f-15212984b168.png#height=828&id=Lv3hN&margin=%5Bobject%20Object%5D&name=image.png&originHeight=828&originWidth=1716&originalType=binary&ratio=1&size=117877&status=done&style=none&width=1716)


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


Midway 在脚手架中提供了标准的 EggJS 的 TS 配置写法，其中包括了完整的定义和属性提示，结构如下。
```typescript
// src/config/config.default.ts

import { EggAppConfig, PowerPartial } from 'egg';
import { MidwayConfig, MidwayAppInfo } from '@midwayjs/core';

export type DefaultConfig = PowerPartial<EggAppConfig>;

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
  } as MidwayConfig & DefaultConfig;
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




## 定时任务
v3 开始请参考 [task 组件](./extesion/task) ， [egg 定时任务](https://eggjs.org/zh-cn/basics/schedule.html) 。



## 日志

v3 开始无法使用 egg-logger，请参考 [日志](../logger)



## 异常处理


EggJS 框架通过 [onerror](https://github.com/eggjs/egg-onerror) 插件提供了统一的错误处理机制。对一个请求的所有处理方法（Middleware、Controller、Service）中抛出的任何异常都会被它捕获，并自动根据请求想要获取的类型返回不同类型的错误（基于 [Content Negotiation](https://tools.ietf.org/html/rfc7231#section-5.3.2)）。



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


### 增加扩展文件


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


扩展了 EggJS 之后，你需要增加扩展的定义。请在 `src/interface.ts` 中扩展增加的 `ctx.hello` 属性。
```typescript
// src/interface.ts
declare module 'egg' {
  interface Context {
    hello: string;
  }
}
```
:::info
业务自定义扩展的定义请 **不要放在根目录** `typings` 下，避免被 ts-helper 工具覆盖掉。
:::


除此之外，还可以扩展其他的定义，MidwayJS 的相关方法也是如此支持的。
```typescript
declare module 'egg' {

  interface Application {										// 扩展 Application
    applicationContext: IMidwayContainer;
    getBaseDir(): string;
    getAppDir(): string;
    getEnv(): string;
    getFrameworkType(): MidwayFrameworkType;
    getProcessType(): MidwayProcessTypeEnum;
    getApplicationContext(): IMidwayContainer;
    getConfig(key?: string): any;
    generateController?(controllerMapping: string);
    generateMiddleware?(middlewareId: string): Promise<Middleware<DefaultState, IMidwayKoaContext>>;
  }

  interface Context {												// 扩展 Context
    requestContext: IMidwayContainer;
  }
}
```


## 

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

| port     | number  | 必填，启动的端口             |
| -------- | ------- | ---------------------------- |
| key      | string  | Buffer                       |
| cert     | string  | Buffer                       |
| ca       | string  | Buffer                       |
| hostname | string  | 监听的 hostname，默认 127.1  |
| http2    | boolean | 可选，http2 支持，默认 false |

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
// src/config/config.default
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

export default {
  // ...
  egg: {
    key: readFileSync(join(__dirname, '../ssl/ssl.key'), 'utf8'),
  	cert: readFileSync(join(__dirname, '../ssl/ssl.pem'), 'utf8'),
  },
}
```



### 修改上下文日志

可以单独修改 koa 框架的上下文日志。

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
![image.png](https://cdn.nlark.com/yuque/0/2021/png/501408/1623158462288-d55fc0ff-dcc3-4c58-b952-101a552efe12.png#clientId=u9825f56d-757f-4&from=paste&height=438&id=uec9c4ff6&margin=%5Bobject%20Object%5D&name=image.png&originHeight=876&originWidth=1478&originalType=binary&ratio=2&size=581313&status=done&style=none&taskId=ubcf947b0-1a9d-43b5-9b57-f678da05da9&width=739)
可以使用 any 绕过。

```typescript
await (this.app as any).mysql.query(sql);
```

或者可以自行增加扩展定义。

