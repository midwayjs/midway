---
title: BodyParser
---

Bodyparser 一般用来对 post 请求的请求体进行解析，是比较常用的 Web 中间件之一。
​

HTTP 协议中并不建议在通过 GET、HEAD 方法访问时传递 body，所以我们无法在 GET、HEAD 方法中按照此方法获取到内容。

## 在 @midwayjs/web 使用

`@midwayjs/web` 默认使用了 Egg.js 基础框架，其中自带了 bodyparser 中间件。我们只需要把需要获取 body 数据的中间件 **放在 Egg.js 框架默认的中间件之后 **即可。
​

我们这里需要使用 Egg.js 自己的中间件配置方式，在 `src/config/config.{env}.ts` 中编写。
​

我们举个例子，编写一个我们自己的中间件。

```typescript
// src/middleware/report.ts

import { Provide } from '@midwayjs/decorator';
import { IWebMiddleware, IMidwayWebNext } from '@midwayjs/web';
import { Context } from 'egg';

@Provide()
export class ReportMiddleware implements IWebMiddleware {
  resolve() {
    return async (ctx: Context, next: IMidwayWebNext) => {
      // 这里获取了 body 数据
      console.log(ctx.request.body);
      await next();
    };
  }
}
```

然后在配置中添加。

```typescript
// src/config/config.default.ts

export default (appInfo: EggAppInfo) => {
  const config = {} as DefaultConfig;

  // ...

  config.middleware = ['reportMiddleware'];

  return config;
};
```

:::info
在 config 文件中配置全局中间件是 Egg.js 的特殊方式，这里配置的中间件一定会在默认的框架中间件之后加载。
:::

Egg.js 中默认的 bodyparer 库为 [koa-bodyparser](https://github.com/koajs/bodyparser) ，默认配置为：

```typescript
// config.default
export const bodyParser = {
  jsonLimit: '100k',
  jsonLimit: '100k',
};
```

一般来说我们最经常调整的配置项就是变更解析时允许的最大长度，可以在 `src/config/config.default.ts` 中覆盖框架的默认值。
​

比如可以设置到 1m。

```typescript
// config.default
export const bodyParser = {
  jsonLimit: '1mb',
  jsonLimit: '1mb',
};
```

更多配置可以查看 [koa-bodyparser](https://github.com/koajs/bodyparser) 文档。
​

## 在 @midwayjs/koa 使用

koa 中可以直接引入 [koa-bodyparser](https://github.com/koajs/bodyparser) 。
​

```bash
$ npm i koa-bodyparser --save
```

​

比如下面的示例：

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

更多配置可以查看 [koa-bodyparser](https://github.com/koajs/bodyparser) 文档。
​

## 在 @midwayjs/express 使用

express 中需要使用 [body-parser](https://github.com/expressjs/body-parser) 中间件。

```bash
$ npm i body-parser --save
```

中间件在 configuration 中加载。

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

## 在 Serverless 下使用

在 Serverless 场景已经默认集成了 bodyparser，用户无需引入其他模块。
​

这个解析行为是固定的，无法修改，并且最大的解析文件大小为 2M。
​

body 数据可以通过 `ctx.request.body` 拿到。
