# Express

本章节内容，主要介绍在 Midway 中如何使用 Express 作为上层框架，并使用自身的能力。

:::tip
Express 的调整暂未完成，请等待完成后再使用。
:::


相关信息：

| 描述                 |      |
| -------------------- | ---- |
| 可作为主框架独立使用 | ✅    |
| 包含自定义日志       | ❌    |
| 可独立添加中间件     | ✅    |



## 安装依赖

```bash
$ npm i @midwayjs/express --save
```




## 创建项目


我们可以使用我们的脚手架来创建一个模版项目：
```bash
$ npm -v

# 如果是 npm v6
$ npm init midway --type=express hello_express

# 如果是 npm v7
$ npm init midway -- --type=express hello_express
```
运行：
```bash
$ cd hello_express 	// 进入项目路径
$ npm run dev		// 本地运行
```


针对 Express，Midway 提供了 `@midwayjs/express` 包进行了适配，在其中提供了 Midway 特有的依赖注入、切面等能力。


这些包列举如下。
```json
  "dependencies": {
    "@midwayjs/express": "^2.3.11",
    "@midwayjs/decorator": "^2.3.11"
  },
  "devDependencies": {
    "@midwayjs/mock": "^2.3.11",
  },
```
| @midwayjs/express | Midway 针对 express 的适配层 |
| --- | --- |
| @midwayjs/decorator | Midway 系列通用的装饰器包 |
| @midwayjs/mock | 本地开发工具包 |

:::info
我们使用的 Express 版本为 `v4` 。
:::


## 目录结构
```
.
├── src
│   ├── controller								 				# controller接口的地方
│   ├── service									 					# service逻辑处理的地方
|   └── configuration.ts									# 入口及生命周期配置、组件管理
├── test
├── package.json
└── tsconfig.json
```




## 控制器（Controller）


整个请求控制器的写法和 Midway 适配其他框架的类似。为了和其他场景的框架写法一致，在请求的时候，Midway 将 Express 的 `req` 即为 `ctx` 对象。
```typescript
import { Inject, Controller, Get, Provide, Query } from '@midwayjs/decorator';
import { Context } from '@midwayjs/express';
import { Request, Response } from 'express';

@Provide()
@Controller('/')
export class HomeController {

  @Inject()
  ctx: Context;

  @Get('/')
  async home(@Query() id) {
    console.log(id);						// this.ctx.req.query.id === id
    return 'hello world'				// 简单返回，等价于 res.send('hello world');
  }
}
```
你也可以额外注入 `req` 和 `res` 。
```typescript
import { Inject, Controller, Get, Provide, Query } from '@midwayjs/decorator';
import { Context } from '@midwayjs/express';
import { Request, Response } from 'express';

@Provide()
@Controller('/')
export class HomeController {

  @Inject()
  ctx: Context;   // 即为 req

  @Inject()
  req: Request;

  @Inject()
  res: Response;

  @Get('/')
  async home(@Query() id) {
    // this.req.query.id === id
  }
}
```



## 编写 Web 中间件


Express 的中间件写法比较特殊，它的参数不同。


```typescript
import { Provide } from '@midwayjs/decorator';
import { IWebMiddleware } from '@midwayjs/express';
import { Request, Response, NextFunction } from 'express';

@Provide()
export class ReportMiddleware implements IWebMiddleware {

  resolve() {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      console.log('Request...');
      next();
    };
  }

}
```


注意，这里我们导出了一个 `ReportMiddleware` 类，这个中间件类的 id 为 `reportMiddleware` 。


## 路由中间件


我们可以把上面编写的中间件应用到单个 Controller 上，也可以将中间件应用到单个路由上。


```typescript
import { Controller, Get, Provide } from '@midwayjs/decorator';

@Provide()
@Controller('/', { middleware: ['reportMiddleware']})			// controller 级别的中间件
export class HomeController {

  @Get('/', { middleware: [ 'reportMiddleware' ]})				// 路由级别的中间件
  async home() {
    return 'hello world'
  }
}
```


## 全局中间件


直接使用 Midway 提供的 `app.generateMiddleware` 方法，在入口处加载全局中间件。
```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import { Application } from '@midwayjs/express';
import { ReportMiddleware } from './middleware/report.middleware.ts'

@Configuration()
export class ContainerLifeCycle implements ILifeCycle {

  @App()
  app: Application;

  async onReady() {
    this.app.useMiddleware(ReportMiddleware);
  }
}
```


除了加载 Class 形式的中间件外，也支持加载传统的 Express 中间件。
```typescript
// src/configuration.ts
import { Configuration, App } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import { Application } from '@midwayjs/express';
import { join } from 'path';

@Configuration()
export class ContainerLifeCycle implements ILifeCycle {

  @App()
  app: Application;

  async onReady() {
    this.app.useMiddleware((req, res, next) => {
    	// xxx
    });
  }
}
```
你可以通过注入 `app` 对象，来调用到所有 Express 上的方法。


## 框架启动参数


`@midwayjs/express`  框架的启动参数如下：

| port | number | 必填，启动的端口 |
| --- | --- | --- |
| key | string | Buffer | Array<Buffer | Object> | 可选，HTTPS 证书 key |
| cert | string | Buffer | Array<Buffer | Object> | 可选，HTTPS 证书 cert |
| ca | string | Buffer | Array<Buffer | Object> | 可选，HTTPS 证书 ca |
| hostname | string | 监听的 hostname，默认 127.1 |
| http2 | boolean | 可选，http2 支持，默认 false |


