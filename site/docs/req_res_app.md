# Application 和 Context

Midway 的应用会同时对外暴露不同协议，比如 Http，WebSocket 等等，这里每个协议对 Midway 来说都是由独立的组件提供的。

比如我们前面示例中的 `@midwayjs/koa` ，就是一个提供 Http 服务的组件，下面我们将以这个组件为例，来介绍内置对象。

每个使用的 Web 框架会提供自己独特的能力，这些独特的能力都会体现在各自的 **上下文**（Context）和 **应用**（Application）之上。



## 定义约定

为了简化使用，所有的暴露协议的组件会导出 **上下文**（Context）和 **应用**（Application）定义，我们都保持一致。即 `Context` 和 `Application` 。

比如：

```typescript
import { Application, Context } from '@midwayjs/koa';
import { Application, Context } from '@midwayjs/express';
import { Application, Context } from '@midwayjs/web';
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
import { Application } from '@midwayjs/koa';
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



### Main Application

Midway 应用对外暴露的协议是组件带来的，每个组件都会暴露自己协议对应的 Application 对象。

这就意味着在一个应用中会包含多个 Application，我们默认约定，在 `src/configuration.ts` 中第一个引入的 Application 即为  **Main Application** （**主要的 Application**）。

比如，下面的 koa 中的 Application 实例即为 **Main Application** （**主要的 Application**）。

```typescript
// src/configuration.ts

import { Configuration } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as ws from '@midwayjs/ws';

@Configuration({
  imports: [koa, ws]
})
export class MainConfiguration implements ILifeCycle {
  // ...
}
```

事实上 Application 都实现与 `IMidwayApplication` 接口，如果使用通用的 API，没有差别。

成为 Main Application 稍微有一些优势：

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
export class MainConfiguration implements ILifeCycle {
  @App()
  koaApp: koa.Application;

  @App('webSocket')
  wsApp: ws.Application;

  async onReady() {
    this.koaApp.useMiddleweare(...);
    this.wsApp.useMiddleweare(...);
  }
}
```

非主要的 Application，需要通过 `@App()` 装饰器的参数或者 [ApplicationManager](./built_in_service#midwayapplicationmanager) 来获取。

 `@App()` 装饰器的参数为组件的 `namespace`。

常见的 namespace 如下：

| Package            | Namespace |
| ------------------ | --------- |
| @midwayjs/web      | egg       |
| @midwayjs/koa      | koa       |
| @midwayjs/express  | express   |
| @midwayjs/grpc     | gRPC      |
| @midwayjs/ws       | webSocket |
| @midwayjs/socketio | socketIO  |
| @midwayjs/faas     | faas      |
| @midwayjs/kafka    | kafka     |
| @midwayjs/rabbitmq | rabbitMQ  |
| @midwayjs/bull     | bull      |



### getAppDir

用于获取项目根目录路径。

```typescript
this.app.getAppDir();
// => /my_project
```



### getBaseDir

用于获取项目 TypeScript 基础路径，默认开发中为 `src` 目录，编译后为 `dist` 目录。

```typescript
this.app.getBaseDir();
// => /my_project/src
```



### getEnv

获取当前项目环境。

```typescript
this.app.getEnv();
// => production
```



### getApplicationContext

获取当前全局依赖注入容器。

```typescript
this.app.getApplicationContext();
```



### getConfig

获取配置。

```typescript
// 获取所有配置
this.app.getConfig();
// 获取特定 key 配置
this.app.getConfig('koa');
// 获取多级配置
this.app.getConfig('midwayLoggers.default.dir');
```



### getLogger

获取某个 Logger，不传参数，默认返回 appLogger。

```typescript
this.app.getLogger();
// => app logger
this.app.getLogger('custom');
// => custom logger
```



### getCoreLogger

获取 Core Logger。

```typescript
this.app.getCoreLogger();
```



### getFrameworkType

获取当前框架类型。

```typescript
this.app.getFrameworkType();
// => MidwayFrameworkType.WEB_KOA
```



### getProjectName

获取项目名，一般从 `package.json` 中获取。



### setAttr & getAttr

直接在 Application 上挂载一个对象会导致定义和维护的困难。

在大多数情况下，用户需要的是临时的全局数据存储的方式，比如在一个应用或者组件内部跨文件临时存取一个数据，从一个类保存，另一个类获取。

为此 Midway 提供了一个全局数据存取的 API，解决这类需求。

```typescript
this.app.setAttr('abc', {
  a: 1,
  b: 2,
});
```

在另一个地方获取即可。

```typescript
const value = this.app.getAttr('abc');
console.log(value);
// { a: 1, b: 2 }
```



## Context

Context 是一个**请求级别的对象**，在每一次收到用户请求时，框架会实例化一个 Context 对象，

在 Http 场景中，这个对象封装了这次用户请求的信息，或者其他获取请求参数，设置响应信息的方法，在 WebSocket，Rabbitmq 等场景中，Context 也有各自的属性，以框架的定义为准。

下面的 API 是每个上下文实现通用的属性或者接口。



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

除了显式声明外，在拦截器或者装饰器设计的时候，由于我们无法得知用户是否写了 ctx 属性，还可以通过内置的 `REQUEST_OBJ_CTX_KEY` 字段来获取。

比如：

```typescript
import { Inject, Controller, Get } from '@midwayjs/decorator';
import { REQUEST_OBJ_CTX_KEY } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {
  
  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    ctx.logger.info(this.ctx === this[REQUEST_OBJ_CTX_KEY]);
    // => true
  }
}
```



### requestContext

Midway 会为每个 Context 挂载一个 `requestContext` 属性，即请求作用域下的依赖注入容器，用来创建请求作用域下的对象。

```typescript
const userService = await this.ctx.requestContext.getAsync(UserService);
// ...
```



### logger

请求作用域下的默认 logger 对象，包含上下文数据。

```typescript
this.ctx.logger.info('xxxx');
```



### startTime

上下文执行开始的时间。

```typescript
this.ctx.startTime
// 1642820640502
```



### setAttr & getAttr

和 `app` 上的方法相同，这些方法的数据是保存在请求链路中，随着请求销毁，你可以在其中放一些请求的临时数据。

```typescript
this.ctx.setAttr('abc', {
  a: 1,
  b: 2,
});
```

在另一个地方获取即可。

```typescript
const value = this.ctx.getAttr('abc');
console.log(value);
// { a: 1, b: 2 }
```



### getLogger

获取某个自定义 Logger 对应的上下文日志。

```typescript
this.ctx.getLogger('custom');
// => custom logger
```

