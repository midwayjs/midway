---
title: 请求、响应、应用
---

Midway 框架会根据不同的场景来启动不同的应用，前文提到，我们默认选用 EggJS 作为我们的 Web 框架，也可以使用 Express 或者 Koa。

每个使用的 Web 框架会提供自己独特的能力，这些独特的能力都会体现在各自的 **请求和响应**（Context）和 **应用**（Application）之上。

## 上下文和应用定义约定

为了简化使用，所有的上层框架导出 **请求和响应**（Context）和 **应用**（Application）定义，我们都保持一致。即 `Context`  和 `Application` 。

```typescript
import { Application, Context } from 'egg';
import { Application, Context } from '@midwayjs/koa';
import { Application, Context } from '@midwayjs/express';
```

且非 Web 框架，我们也保持了一致。

```typescript
import { Application, Context } from '@midwayjs/socketio';
import { Application, Context } from '@midwayjs/grpc';
import { Application, Context } from '@midwayjs/rabbitmq';
```

## 请求和响应

每个 Web 框架的请求和响应对象是不同的，EggJS 和 Koa 都是使用 `ctx`  对象，而 Express 使用 `req` ， `res`  对象。

在 Midway 提供的装饰器不够，或者需要复杂业务逻辑的时候，我们就需要原生框架的对象支持。

在 **默认的请求作用域 **中，也就是说在 控制器（Controller）或者普通的 服务（Service）中，我们可以使用 `@Inject`  来注入对应的实例。

比如在以 EggJS 为上层 Web 框架代码中，我们可以这样获取到对应的 ctx 实例。

```typescript
import { Inject, Controller, Get, Provide } from '@midwayjs/decorator';
import { Context } from 'egg';

@Provide()
@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    // this.ctx.query
  }
}
```

而 Koa 和 Express 则是不同的用法。Koa 示例如下。

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
    // this.ctx.query
  }
}
```

Express 比较特殊， `@Inject`  注入的 ctx 对象由 Midway 做了封装，为 Express 的 req 对象和 res 对象的集合。

```typescript
import { Inject, Controller, Get, Provide } from '@midwayjs/decorator';
import { Context } from '@midwayjs/express';
import { Request, Response } from 'express';

@Provide()
@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context; // 包含了 req 和 res

  @Inject()
  req: Request;

  @Inject()
  res: Response;

  @Get('/')
  async home() {
    // this.req.query
  }
}
```

## 应用实例

在编写业务代码中，有时候我们需要用到原本框架的能力，而这些能力可能暴露在各自的 app 对象之上。Midway 提供了 `@App`  这个装饰器，用于注入当前运行时的 app 示例。

比如，在 EggJS 框架中，app 提供了 `curl`  方法，用于获取远程的数据，我们通过注入这个 app 就可以拿到对应的方法。

```typescript
import { App, Controller, Get, Provide } from '@midwayjs/decorator';
import { Application } from 'egg';

@Provide()
@Controller('/')
export class HomeController {
  @App()
  app: Application;

  @Get('/')
  async home() {
    const data = await this.app.curl('/api/data.json');
    return {
      data,
    };
  }
}
```

:::info
我们在任意的 `@Provide`  装饰的 Class 上都可以使用 `@App`  装饰器。
:::

而在 Koa 为 Web 框架的应用上，将会注入 Koa 的 app 实例。

```typescript
import { App, Controller, Get, Provide } from '@midwayjs/decorator';
import { Application } from '@midwayjs/koa';

@Provide()
@Controller('/')
export class HomeController {
  @App()
  app: Application;

  @Get('/')
  async home() {
    // this.app.use(xxx)
  }
}
```

:::info
这里的 **Application**  定义是由于 Koa 不支持直接扩展，Midway 为了方便使用，进行了封装。
:::

具体的 app 上的方法，请参考详细 app API 或者不同的 Web 框架文档。
