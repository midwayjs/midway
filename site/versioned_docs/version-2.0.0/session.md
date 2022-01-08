---
title: Session
---

Session 在计算机中，尤其是在网络应用中，称为“会话控制”。Session 对象存储特定用户会话所需的属性及配置信息。这样，当用户在应用程序的 Web 页之间跳转时，存储在 Session 对象中的变量将不会丢失，而是在整个用户会话中一直存在下去。当用户请求来自应用程序的 Web 页时，如果该用户还没有会话，则 Web 服务器将自动创建一个 Session 对象。当会话过期或被放弃后，服务器将终止该会话。

## 在 @midwayjs/web 使用

框架内置了 [Session](https://github.com/eggjs/egg-session) 插件，给我们提供了 `ctx.session` 来访问或者修改当前用户 Session 。

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
    // 获取 Session 上的内容
    const userId = this.ctx.session.userId;
    // ...

    // 修改 Session 的值
    this.ctx.session.visited = this.ctx.session.visited ? this.ctx.session.visited + 1 : 1;
  }
}
```

Session 的使用方法非常直观，直接读取它或者修改它就可以了，如果要删除它，直接将它赋值为 null：

```typescript
ctx.session = null;
```

需要 **特别注意 **的是：设置 session 属性时需要避免以下几种情况（会造成字段丢失，详见[koa-session](https://github.com/koajs/session/blob/master/lib/session.js#L37-L47)源码）

- 不要以 \_ 开头
- 不能为 isNew

```typescript
// ❌ 错误的用法
ctx.session._visited = 1; //    --> 该字段会在下一次请求时丢失
ctx.session.isNew = 'HeHe'; //    --> 为内部关键字, 不应该去更改

// ✔️ 正确的用法
ctx.session.visited = 1; //   -->  此处没有问题
```

Session 的实现是基于 Cookie 的，默认配置下，用户 Session 的内容加密后直接存储在 Cookie 中的一个字段中，用户每次请求我们网站的时候都会带上这个 Cookie，我们在服务端解密后使用。Session 的默认配置如下：

```typescript
export const session = {
  key: 'EGG_SESS',
  maxAge: 24 * 3600 * 1000, // 1 天
  httpOnly: true,
  encrypt: true,
};
```

可以看到这些参数除了 key 都是 Cookie 的参数，key 代表了存储 Session 的 Cookie 键值对的 key 是什么。在默认的配置下，存放 Session 的 Cookie 将会加密存储、不可被前端 js 访问，这样可以保证用户的 Session 是安全的。

Session 默认存放在 Cookie 中，如需放在其他存储中，具体可以查阅 [Cookie 与 Session](https://eggjs.org/zh-cn/core/cookie-and-session.html)。

## 在 @midwayjs/koa 使用

koa 原生功能只提供了 Cookie 的操作，但是没有提供 Session 操作。Session 就只用自己实现或者通过第三方中间件实现。

常用的 koa session 中间件有 [koa-session](https://github.com/koajs/session)。koa-session 默认基于 cookie 来实现 Session 数据存储，同时也支持其他存储的扩展。

首先需要安装中间件。

```bash
$ npm install koa-session --save
```

在启动时加载该中间件，示例如下：

```typescript
// configuration.ts

import { Configuration, App } from '@midwayjs/decorator';
import { Application } from '@midwayjs/koa';
import * as session from 'koa-session';

@Configuration()
export class AutoConfiguration {
  @App()
  app: Application;

  async onReady() {
    this.app.use(
      session(
        {
          key: 'koa.sess', // cookie key
          maxAge: 24 * 3600 * 1000, // 1天
        },
        this.app
      )
    );
  }
}
```

这里的配置也可以放到 config 中，然后使用 `@Config` 装饰器注入。

这里中间件的更多选项可以参考 [koa-session 文档](https://github.com/koajs/session)。

之后就可以在其他地方使用了，比如：

```typescript
// src/controller/home.ts

import { Controller, Get, Provide, Inject } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

@Provide()
@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    this.ctx.session.visits = this.ctx.session.visits ? this.ctx.session.visits + 1 : 1;
  }
}
```

也可以使用 `@Session` 装饰器获取 Session。

```typescript
// src/controller/home.ts

import { Controller, Get, Provide, Inject, Session, ALL } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

@Provide()
@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home(@Session() visits = 1) {
    this.req.session.visits = session.visits = visits + 1;
  }
}
```

或者直接获取整个 Session。

```typescript
// src/controller/home.ts

import { Controller, Get, Provide, Session, ALL } from '@midwayjs/decorator';

@Provide()
@Controller('/')
export class HomeController {
  @Get('/')
  async home(@Session(ALL) session) {
    session.visits = session.visits ? session.visits + 1 : 1;
  }
}
```

如需使用不同的存储，可以使用类似的 [generic-session](https://github.com/koajs/generic-session) 来替换该中间件。

## 在 @midwayjs/express 使用

首先安装依赖。

```bash
$ npm i express-session
$ npm i -D @types/express-session
```

加到中间件中。

```typescript
// configuration.ts

import { Configuration, App } from '@midwayjs/decorator';
import { Application } from '@midwayjs/express';
import * as session from 'express-session';

@Configuration()
export class AutoConfiguration {
  @App()
  app: Application;

  async onReady() {
    this.app.use(
      session({
        secret: 'my-secret',
        resave: false,
        saveUninitialized: false,
      })
    );
  }
}
```

`secret` 用于对 sessionId cookie 进行加密。它可以是字符串，也可以是多个秘钥字符串组成的数组。如果提供了数组，则使用第一个字符串进行签名，而在验证请求中的签名时会循环所有的加密串。

这个秘钥最好是随机的一组字符。

通过获取 req 对象设置获取 Session 中的值。

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
    this.req.session.visits = this.req.session.visits ? this.req.session.visits + 1 : 1;
  }
}
```

也可以使用 `@Session` 装饰器获取 Session。

```typescript
// src/controller/home.ts

import { Controller, Get, Provide, Inject, Session, ALL } from '@midwayjs/decorator';
import { Context } from '@midwayjs/express';
import { Request } from 'express';

@Provide()
@Controller('/')
export class HomeController {
  @Inject()
  req: Request;

  @Get('/')
  async home(@Session() visits = 1) {
    this.req.session.visits = session.visits = visits + 1;
  }
}
```

或者直接获取整个 Session。

```typescript
// src/controller/home.ts

import { Controller, Get, Provide, Session, ALL } from '@midwayjs/decorator';
import { Context } from '@midwayjs/express';

@Provide()
@Controller('/')
export class HomeController {
  @Get('/')
  async home(@Session(ALL) session) {
    session.visits = session.visits ? session.visits + 1 : 1;
  }
}
```

## 在 Serverless 场景使用

Serverless 场景有与弹性的存在，没有维护 Session 的必要性，最多只能使用基于 Cookie 的 Session。
