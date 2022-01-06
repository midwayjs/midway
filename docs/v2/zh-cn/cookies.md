---
title: Cookies
---

HTTP Cookie（也叫 Web Cookie 或浏览器 Cookie）是服务器发送到用户浏览器并保存在本地的一小块数据，它会在浏览器下次向同一服务器再发起请求时被携带并发送到服务器上。通常，它用于告知服务端两个请求是否来自同一浏览器，如保持用户的登录状态。Cookie 使基于无状态的 HTTP 协议记录稳定的状态信息成为了可能。
Cookie 主要用于以下三个方面：

- 会话状态管理（如用户登录状态、购物车、游戏分数或其它需要记录的信息）
- 个性化设置（如用户自定义设置、主题等）
- 浏览器行为跟踪（如跟踪分析用户行为等）

## 在 @midwayjs/web 使用

通过 `ctx.cookies`，我们可以在有 ctx 的时候便捷、安全的设置和读取 Cookie。

比如 Controller 中。

```typescript
// src/controller/home.ts

import { Controller, Get, Provide, Inject } from '@midwayjs/decorator';
import { Context } from 'egg';

@Provide()
@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    // 获取 cookie
    let count = this.ctx.cookies.get('count');
    count = count ? Number(count) : 0;

    // 设置 cookie
    this.ctx.cookies.set('count', ++count);

    return count;
  }
}
```

`ctx.cookies`  的方法上有更多的参数，具体可以查阅 [Cookie 与 Session](https://eggjs.org/zh-cn/core/cookie-and-session.html)。

## 在 @midwayjs/koa 使用

koa 提供了从上下文直接读取、写入 cookie 的方法

- `ctx.cookies.get(name, [options])` 读取上下文请求中的 cookie
- `ctx.cookies.set(name, value, [options])` 在上下文中写入 cookie

操作 cookies 是使用了 [cookies](https://github.com/pillarjs/cookies) 模块。

示例如下：

```typescript
import { Inject, Controller, Get, Provide } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

@Provide()
@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    this.ctx.cookies.set('cid', 'hello world', {
      domain: 'localhost', // 写cookie所在的域名
      path: '/index', // 写cookie所在的路径
      maxAge: 10 * 60 * 1000, // cookie有效时长
      expires: new Date('2017-02-15'), // cookie失效时间
      httpOnly: false, // 是否只用于http请求中获取
      overwrite: false, // 是否允许重写
    });
    ctx.body = 'cookie is ok';
  }
}
```

## 在 @midwayjs/express 使用

首先安装 `cookie-parser`  依赖。

```bash
$ npm i cookie-parser --save
$ npm i @types/cookie-parser --save-dev
```

加到中间件中。

```typescript
// configuration.ts

import { Configuration, App } from '@midwayjs/decorator';
import { Application } from '@midwayjs/express';
import * as cookieParser from 'cookie-parser';

@Configuration()
export class AutoConfiguration {
  @App()
  app: Application;

  async onReady() {
    this.app.use(cookieParser());
  }
}
```

cookieParser 中间件中包含一些参数：

- **secret **一个字符串或者数组，用来给 cookie 签名。如果提供了一个数组，将尝试依次使用其元素来作为 secret 解析 cookie。
- **option** 一个作为第二个参数传递给 `cookie.parse`  的对象，参见 [cookie](https://www.npmjs.org/package/cookie) 来了解更多内容。

获取 req 对象获取 Cookie。

```typescript
// src/controller/home.ts

import { Controller, Get, Provide, Inject } from '@midwayjs/decorator';
import { Context } from '@midwayjs/express';
import { Request } from 'express';

@Provide()
@Controller('/')
export class HomeController {
  @Inject()
  req: Request;

  @Get('/')
  async home() {
    // 获取未加密的 cookie
    console.log('Cookies: ', this.req.cookies);

    // 获取加密的 cookie
    console.log('Signed Cookies: ', this.req.signedCookies);
  }
}
```

更多 API 可以参考 [cookie-parser](https://github.com/expressjs/cookie-parser)。

## 在 Serverless 场景使用

当前 Serverless 场景中使用的也是 [cookies](https://github.com/pillarjs/cookies) 模块，和 koa 使用的相同。

即依旧可以从上下文直接读取、写入 cookies。
