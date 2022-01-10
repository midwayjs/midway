# 请求、响应、应用

Midway 的应用会同时对外暴露不同协议，比如 Http，WebSocket 等等，这里每个协议对 Midway 来说都是由独立的组件提供的。

比如我们前面示例中的 `@midwayjs/koa` ，就是一个提供 Http 服务的组件，下面我们将以这个组件为例，来介绍内置对象。

每个使用的 Web 框架会提供自己独特的能力，这些独特的能力都会体现在各自的 **请求和响应**（Context）和 **应用**（Application）之上。



## 应用和上下文定义约定

为了简化使用，所有的暴露协议的组件会导出 **请求和响应**（Context）和 **应用**（Application）定义，我们都保持一致。即 `Context` 和 `Application` 。

比如：

```typescript
import { Application, Context } from '@midwayjs/koa';
import { Application, Context } from '@midwayjs/express';
import { Application, Context } from 'egg';
```

且非 Web 框架，我们也保持了一致。

```typescript
import { Application, Context } from '@midwayjs/socketio';
import { Application, Context } from '@midwayjs/grpc';
import { Application, Context } from '@midwayjs/rabbitmq';
```



## Application

Application 是某一个组件中的应用对象，在不同的组件中，可能有着不同的实现。Application 对象上会包含一些统一的方法，这些方法统一来自于 `IMidwayApplication` 定义。

```typescript
import { Application, Context } from '@midwayjs/koa';
```



### 获取方式

在所有被依赖注入容器管理的类中，都可以使用 `@App()` 装饰器来获取 **当前最主要** 的 Application。

比如：

```typescript
import { App, Controller, Get } from '@midwayjs/decorator';
import { Application } from '@midwayjs/koa';

@Controller('/')
export class HomeController {

  @App()
  app: Application;

  @Get('/')
  async home() {
    // this.app.getConfig()
    // this.app.getEnv()
  }
}
```



### 主 Application

Midway 应用对外暴露的协议是组件带来的，每个组件都会暴露自己协议对应的 Application 对象。

这就意味着在一个应用中会包含多个 Application，我们默认约定，在 `src/configuration.ts` 中第一个引入的 Application 即为 **主 Application**。

比如，下面的 koa 中的 Application 实例即为 **主 Application**。

```typescript
// src/configuration.ts

import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as ws from '@midwayjs/ws';

@Configuration({
  imports: [koa, ws]
})
export class ContainerConfiguration implements ILifeCycle {
  // ...
}
```

事实上 Application 都实现与 `IMidwayApplication` 接口，如果使用通用的 API，没有差别。

成为主 Application 稍微有一些优势：

- 在大部分的场景下，使用 `@App()` 即可注入获取，无需其他参数
- 优先初始化

比如在多个导出 Application 组件需要加载中间件的情况下，可以简单的编码。

```typescript
// src/configuration.ts

import { Configuration, MidwayFrameworkType } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as ws from '@midwayjs/ws';

@Configuration({
  imports: [koa, ws]
})
export class ContainerConfiguration implements ILifeCycle {
  @App()
  koaApp: koa.Application;
  
  @App(MidwayFrameworkType.WS)
  wsApp: ws.Application;
  
  async onReady() {
    this.koaApp.useMiddleweare(...);
    this.wsApp.useMiddleweare(...);
  }
}
```

非主要的 Application，需要通过 `@App()` 装饰器的参数来获取。



## Context

Context 是一个**请求级别的对象**，在每一次收到用户请求时，框架会实例化一个 Context 对象，

在 Http 场景中，这个对象封装了这次用户请求的信息，或者其他获取请求参数，设置响应信息的方法。



### 获取方式


在 **默认的请求作用域 **中，也就是说在 控制器（Controller）或者普通的服务（Service）中，我们可以使用 `@Inject` 来注入对应的实例。


比如可以这样获取到对应的 ctx 实例。

```typescript
import { Inject, Controller, Get } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

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
