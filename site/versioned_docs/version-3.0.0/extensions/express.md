# Express

本章节内容，主要介绍在 Midway 中如何使用 Express 作为上层框架，并使用自身的能力。

| 描述           |      |
| -------------- | ---- |
| 包含独立主框架 | ✅    |
| 包含独立日志   | ✅    |



## 安装依赖

```bash
$ npm i @midwayjs/express@3 --save
$ npm i @types/body-parser @types/express @types/express-session --save-dev
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/express": "^3.0.0",
    // ...
  },
  "devDependencies": {
    "@types/body-parser": "^1.19.2",
    "@types/express": "^4.17.13",
    "@types/express-session": "^1.17.4",
    // ...
  }
}
```

也可以直接使用脚手架创建示例。

```bash
# npm v6
$ npm init midway --type=express-v3 my_project

# npm v7
$ npm init midway -- --type=express-v3 my_project
```


针对 Express，Midway 提供了 `@midwayjs/express` 包进行了适配，在其中提供了 Midway 特有的依赖注入、切面等能力。

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



## 开启组件

```typescript
import { Configuration, App } from '@midwayjs/core';
import * as express from '@midwayjs/express';
import { join } from 'path';

@Configuration({
  imports: [express],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  @App()
  app: express.Application;

  async onReady() {}
}
```




## 控制器（Controller）


整个请求控制器的写法和 Midway 适配其他框架的类似。为了和其他场景的框架写法一致，在请求的时候，Midway 将 Express 的 `req` 映射为 `ctx` 对象。
```typescript
import { Inject, Controller, Get, Provide, Query } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/express';

@Controller('/')
export class HomeController {

  @Inject()
  ctx: Context;

  @Get('/')
  async home(@Query() id) {
    console.log(id);						// req.query.id === id
    return 'hello world';				// 简单返回，等价于 res.send('hello world');
  }
}
```
你也可以额外注入 `req` 和 `res` 。
```typescript
import { Inject, Controller, Get, Provide, Query } from '@midwayjs/core';
import { Context, Response, NextFunction } from '@midwayjs/express';

@Controller('/')
export class HomeController {

  @Inject()
  ctx: Context;   // 即为 req

  @Inject()
  req: Context;

  @Inject()
  res: Response;

  @Get('/')
  async home(@Query() id) {
    // this.req.query.id === id
  }
}
```



## Web 中间件


Express 的中间件写法比较特殊，它的参数不同。


```typescript
import { Middleware } from '@midwayjs/core';
import { Context, Response, NextFunction } from '@midwayjs/express';

@Middleware()
export class ReportMiddleware implements IMiddleware<Context, Response, NextFunction> {

  resolve() {
    return async (
      req: Context,
      res: Response,
      next: NextFunction
    ) => {
      console.log('Request...');
      next();
    };
  }

}
```

注意，这里我们导出了一个 `ReportMiddleware` 类，为了方便对接异步流程，`resolve` 返回可以是 async 函数。

Express 中的 next 方法，用于调用到下一个中间件，指的注意的是，Express 中间件并非洋葱模型，是单向调用。




### 路由中间件


我们可以把上面编写的中间件应用到单个 Controller 上，也可以将中间件应用到单个路由上。


```typescript
import { Controller, Get, Provide } from '@midwayjs/core';

@Controller('/', { middleware: [ ReportMiddleware ]})			// controller 级别的中间件
export class HomeController {

  @Get('/', { middleware: [ ReportMiddleware ]})				// 路由级别的中间件
  async home() {
    return 'hello world'
  }
}
```


### 全局中间件


直接使用 Midway 提供的 `app.generateMiddleware` 方法，在入口处加载全局中间件。
```typescript
// src/configuration.ts
import { Configuration, ILifeCycle } from '@midwayjs/core';
import * as express from '@midwayjs/express';
import { ReportMiddleware } from './middleware/report.middleware.ts'

@Configuration({
  imports: [express],
})
export class MainConfiguration implements ILifeCycle {

  @App()
  app: express.Application;

  async onReady() {
    this.app.useMiddleware(ReportMiddleware);
  }
}
```


除了加载 Class 形式的中间件外，也支持加载传统的 Express 中间件。
```typescript
// src/configuration.ts
import { Configuration, ILifeCycle, App } from '@midwayjs/core';
import * as express from '@midwayjs/express';
import { join } from 'path';

@Configuration({
  imports: [express],
})
export class MainConfiguration implements ILifeCycle {

  @App()
  app: express.Application;

  async onReady() {
    this.app.useMiddleware((req, res, next) => {
    	// xxx
    });
  }
}
```
你可以通过注入 `app` 对象，来调用到所有 Express 上的方法。



## 返回统一处理

由于 Express 中间件是单向调用，无法在返回时执行，为此我们额外设计了一个 `@Match` 装饰的过滤器，用于处理返回值的行为。

比如，我们可以定义针对全局返回的过滤器。

```typescript
// src/filter/globalMatch.filter.ts
import { Match } from '@midwayjs/core';
import { Context, Response } from '@midwayjs/express';

@Match()
export class GlobalMatchFilter {
  match(value, req, res) {
    // ...
    return {
      status: 200,
      data: {
        value
      },
    };
  }
}
```

也可以匹配特定的路由做返回。

```typescript
// src/filter/api.filter.ts
import { Match } from '@midwayjs/core';
import { Context, Response } from '@midwayjs/express';

@Match((ctx: Context, res: Response) => {
  return ctx.path === '/api';
})
export class APIMatchFilter {
  match(value, req: Context, res: Response) {
    // ...
    return {
      data: {
        message:
        data: value,
      },
    };
  }
}
```

需要应用到 app 中。

```typescript
import { Configuration, App } from '@midwayjs/core';
import * as express from '@midwayjs/express';
import { join } from 'path';
import { APIMatchFilter } from './filter/api.filter';
import { GlobalMatchFilter } from 'filter/globalMatch.filter';

@Configuration({
  imports: [express],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  @App()
  app: express.Application;

  async onReady() {
    // ...
    this.app.useFilter([APIMatchFilter, GlobalMatchFilter]);
  }
}
```

注意，这类过滤器是按照添加的顺序来匹配执行。



## 错误处理

和普通的项目相同，使用错误过滤器，但是参数略有不同。

```typescript
import { Catch } from '@midwayjs/core';
import { Context, Response } from '@midwayjs/express';

@Catch()
export class GlobalError {
  catch(err: Error, req: Context, res: Response) {
    if (err) {
      return {
        status: err.status ?? 500,
        message: err.message,
      }
    }
  }
}
```

需要应用到 app 中。

```typescript
import { Configuration, App } from '@midwayjs/core';
import * as express from '@midwayjs/express';
import { join } from 'path';
import { GlobalError } from './filter/global.filter';

@Configuration({
  imports: [express],
  importConfigs: [join(__dirname, './config')],
})
export class MainConfiguration {
  @App()
  app: express.Application;

  async onReady() {
    this.app.useMiddleware((req, res, next) => {
      next();
    });

    this.app.useFilter([GlobalError]);
  }
}
```

注意，`@Match` 和 `@Catch` 都是过滤器，在内部会自动判断做区分执行。。



## Cookie

`@midwayjs/express` 自带  `cookie parser` 功能，使用的是 `cookie-parser` 模块。

针对 Cookie，统一使用 `keys` 作为秘钥。

```typescript
// src/config/config.default
export default {
  keys:  ['key1', 'key2'],
}
```

获取 Cookie。

```typescript
const cookieValue = req.cookies['cookie-key'];
```

设置 Cookie。

```typescript
res.cookie(
  'cookie-key',
  'cookie-value',
  cookieOptions
);
```



##  Session

`@midwayjs/express` 内置了 Session 组件，给我们提供了 `ctx.session` 来访问或者修改当前用户 Session 。

默认情况下为 `cookie-session` ，默认配置如下。

```typescript
// src/config/config.default
export default {
  session:  {
    name: 'MW_SESS',
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 3600 * 1000, // ms
      httpOnly: true,
      // sameSite: null,
    },
  }
}
```

我们可以通过简单的 API 来设置 session。

```typescript
@Controller('/')
export class HomeController {

  @Inject()
  req;

  @Get('/')
  async get() {
    // set all
    this.req.session = req.query;

    // set value
    this.req.session.key = 'abc';

    // get
    const key = this.req.session.key;

    // remove
    this.req.session = null;

    // set max age
    this.req.session.maxAge = Number(req.query.maxAge);

    // ...
  }
}

```



## BodyParser

`@midwayjs/express` 自带  `bodyParser` 功能，默认会解析 `Post` 请求，自动识别 `json` 、`text`和 `urlencoded` 类型。

默认的大小限制为 `1mb`，可以单独对每项配置大小。

```typescript
// src/config/config.default
export default {
  // ...
  bodyParser: {
    json: {
      enable: true,
      limit: '1mb',
      strict: true,
    },
    raw: {
      enable: false,
      limit: '1mb',
    },
    text: {
      enable: true,
      limit: '1mb',
    },
    urlencoded: {
      enable: true,
      extended: false,
      limit: '1mb',
      parameterLimit: 1000,
    },
  },
}
```



## 配置

### 默认配置

`@midwayjs/express`  的配置样例如下：

```typescript
// src/config/config.default
export default {
  // ...
  express: {
    port: 7001,
  },
}
```

所有属性描述如下：

| 属性         | 类型                                      | 描述                                                    |
| ------------ | ----------------------------------------- | ------------------------------------------------------- |
| port         | number                                    | 可选，启动的端口                                        |
| globalPrefix | string                                    | 可选，全局的 http 前缀                                  |
| keys         | string[]                                  | 可选，Cookies 签名，如果上层未写 keys，也可以在这里设置 |
| hostname     | string                                    | 可选，监听的 hostname，默认 127.1                       |
| key          | string \| Buffer \| Array<Buffer\|Object> | 可选，Https key，服务端私钥                             |
| cert         | string \| Buffer \| Array<Buffer\|Object> | 可选，Https cert，服务端证书                            |
| ca           | string \| Buffer \| Array<Buffer\|Object> | 可选，Https ca                                          |
| http2        | boolean                                   | 可选，http2 支持，默认 false                            |



### 修改端口

默认情况下，我们在 `config.default` 提供了 `7001` 的默认端口参数，修改它就可以修改 Express http 服务的默认端口。

比如我们修改为 `6001`：

```typescript
// src/config/config.default
export default {
  // ...
  express: {
    port: 6001,
  },
}
```

默认情况下，单测环境由于需要 supertest 来启动端口，我们的 port 配置为 `null`。

```typescript
// src/config/config.unittest
export default {
  // ...
  express: {
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
  express: {
    key: join(__dirname, '../ssl/ssl.key'),
    cert: join(__dirname, '../ssl/ssl.pem'),
  },
}
```



### 修改上下文日志

可以单独修改 express 框架的上下文日志。

```typescript
export default {
  express: {
    contextLoggerFormat: info => {
      // 等价 req
      const req = info.ctx;
      const userId = req?.['session']?.['userId'] || '-';
      return `${info.timestamp} ${info.LEVEL} ${info.pid} [${userId} - ${Date.now() - req.startTime}ms ${req.method}] ${info.message}`;
    }
    // ...
  },
};
```

