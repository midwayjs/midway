# Express

本章节内容，主要介绍在 Midway 中如何使用 Express 作为上层框架，并使用自身的能力。


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


整个请求控制器的写法和 Midway 适配其他框架的类似。为了和其他场景的框架写法一致，在请求的时候，Midway 将 Express 的 `req` 和 `res` 包装为 `ctx` 对象。
```typescript
import { Inject, Controller, Get, Provide, Query } from '@midwayjs/decorator';
import { Context } from '@midwayjs/express';
import { Request, Response } from 'express';

@Provide()
@Controller('/')
export class HomeController {

  @Inject()
  ctx: Context;   // 包含了 req 和 res

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
  ctx: Context;   // 包含了 req 和 res
  
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
### 请求参数装饰器


在 @midwayjs/express 中，可以使用大部分的请求装饰器，具体的列表如下：

| @Query | √ |
| --- | --- |
| @Body | 需要自行安装 body 解析库后使用 |
| @Param | √ |
| @Headers | √ |
| @Session | 需要自行安装 session 后使用 |
| @RequestPath | √ |
| @RequestIP | √ |
| @Queries | 同 @Query |



由于 express 框架相对纯粹，默认情况下，我们没有埋入 body 解析的库。 `@Body` 装饰器将在安装了解析 body 库之后才能使用。


下面就是如何使用 body 解析库的示例：


首先安装模块。
```bash
$ npm i body-parser --save
```
然后中间件在 configuration 中加载。
```typescript
// configuration.ts

import { Configuration, App } from '@midwayjs/decorator';
import { Application } from '@midwayjs/express';
import * as bodyParser from 'body-parser';

@Configuration()
export class AutoConfiguration {
  @App()
  app: Application;
  
  async onReady() {
    this.app.use(bodyParser.json());
		this.app.use(bodyParser.urlencoded({ extended: false }));
  }
}
```
更多配置可以查看 [body-parser](https://github.com/expressjs/body-parser) 文档。


同理 Session 支持也可以查看 [Session 文档](session)。


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

@Configuration()
export class ContainerLifeCycle implements ILifeCycle {
  
  @App()
  app: Application;
  
  async onReady() {
    this.app.use(await this.app.generateMiddleware('reportMiddleware'));
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
    this.app.use((req, res, next) => {
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





## 部署


### 部署到普通应用容器


Midway 构建出来的项目是单进程的，不管是采用 `fork` 模式还是 `cluster` 模式，单进程的代码总是很容易的兼容到不同的体系中，因此非常容易被社区现有的 pm2/forever 等工具所加载，


我们这里以 pm2 来演示如何部署。


项目一般都需要一个入口文件，比如，我们在根目录创建一个 `bootstrap.js` 作为我们的部署文件。
```
➜  hello_express tree
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
const WebFramework = require('@midwayjs/express').Framework;
// 初始化 web 框架并传入启动参数
const web = new WebFramework().configure({
  port: 7001
});

const { Bootstrap } = require('@midwayjs/bootstrap');

// 加载框架并执行
Bootstrap
  .load(web)
  .run();
```
我们提供的每个上层框架都将会导出一个 `Framework` 类，而 `Bootstrap` 的作用则是加载这些框架，传入启动参数，运行他们。


这个时候，你已经可以直接使用 `node bootstrap.js` 来启动代码了，也可以使用 pm2 来执行启动。
```bash
$ npm install -g pm2
$ pm2 start bootstrap.js
```


### 部署到 Serverless 环境


Serverless 环境指的是阿里云 FC，腾讯云等函数环境。Midway 可以将现有的 Web 项目部署为 Serverless 应用，这里以部署到阿里云函数计算作为示例。


1、添加 `f.yml` 文件到你的项目根目录。
```
➜  hello_express tree
.
├── src
├── dist                
├── f.yml  								# Midway Serverless 部署配置文件
├── package.json  
└── tsconfig.json
```
```yaml
service: my-midway-app  ## 应用发布到云平台的名字，一般指应用名

provider:
  name: aliyun        ## 发布的云平台，aliyun，tencent 等

deployType: express       ## 部署的应用类型
```


2、代码修改


将 `bootstrap.js` 重命名为 `app.js` ，移除内部的端口（Serverless 环境不需要），并返回一个 app。


修改后的代码如下：
```typescript
// 获取框架
const WebFramework = require('@midwayjs/express').Framework;
// 初始化 web 框架并传入启动参数
const web = new WebFramework().configure({});
const { Bootstrap } = require('@midwayjs/bootstrap');

module.exports = async () => {
  // 加载框架并执行
  await Bootstrap
  .load(web)
  .run();
  // 返回 app 对象
  return web.getApplication();
}

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
![image.png](https://cdn.nlark.com/yuque/0/2020/png/501408/1600835297676-1753de7a-fb0d-46ca-98f0-944eba5b2f2b.png#height=193&id=WKAhy&margin=%5Bobject%20Object%5D&name=image.png&originHeight=193&originWidth=1219&originalType=binary&ratio=1&size=35152&status=done&style=none&width=1219)
如需更详细的发布文档，请查阅 [**Serverless 发布 FAQ**](https://www.yuque.com/midwayjs/faas/deploy_aliyun_faq)。