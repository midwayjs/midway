# 内置对象

在 Midway 中，提供了众多的内置对象，方便用户使用。

在本章节，我们会介绍和框架相关联的的 Application，Context 对象，Midway 默认容器上的一些服务对象，这些对象在整个业务的开发中都会经常遇到。

Midway 的应用会同时对外暴露不同协议，比如 Http，WebSocket 等等，这里每个协议对 Midway 来说都是由独立的组件提供的。

比如我们前面示例中的 `@midwayjs/koa` ，就是一个提供 Http 服务的组件，下面我们将以这个组件为例，来介绍内置对象。




## Application

Application 是某一个组件中的应用对象，在不同的组件中，可能有着不同的实现。Application 对象上会包含一些统一的方法，这些方法统一来自于 `IMidwayApplication` 定义。

```typescript
import { Application, Context } from '@midwayjs/koa';
```



### 获取方式

在所有被依赖注入容器管理的类中，都可以使用 `@App()` 装饰器来获取当前最主要的 Application。

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



## 容器内置服务

以下是一些 Midway 依赖注入容器内置的服务，这些服务由依赖注入容器初始化，在业务中全局可用。



### MidwayInformationService

Midway 内置的信息服务，提供基础的项目数据。

可以通过注入获取。

```typescript
import { Inject, Controller, Get } from '@midwayjs/decorator';
import { MidwayInformationService } from '@midwayjs/core';

@Controller('/')
export class HomeController {

  @Inject()
  informationService: MidwayInformationService;

  @Get('/')
  async home() {
    // this.informationService.getAppDir();
  }
}
```

一般用来返回用户相关的目录。

| API          | 返回类型 | 描述                                                    |
| ------------ | -------- | ------------------------------------------------------- |
| getAppDir()  | String   | 返回应用根目录                                          |
| getBaseDir() | String   | 返回应用代码目录，默认本地开发为 src，服务器运行为 dist |
| getHome      | String   | 返回机器用户目录，指代 ~ 的地址。                       |
| getPkg       | Object   | 返回 package.json 的内容                                |
| getRoot      | String   | 在开发环境，返回 appDir，在其他环境，返回 Home 目录     |



### MidwayEnvironmentService

Midway 内置的环境服务，提供环境设置和判断。

可以通过注入获取。

```typescript
import { Inject, Controller, Get } from '@midwayjs/decorator';
import { MidwayEnvironmentService } from '@midwayjs/core';

@Controller('/')
export class HomeController {

  @Inject()
  environmentService: MidwayEnvironmentService;

  @Get('/')
  async home() {
    // this.environmentService.getCurrentEnvironment();
  }
}
```

一般用来获取当前的环境，API 如下：

| API                      | 返回类型 | 描述               |
| ------------------------ | -------- | ------------------ |
| getCurrentEnvironment()  | String   | 返回应用当前环境   |
| setCurrentEnvironment()  |          | 设置当前环境       |
| isDevelopmentEnvironment | Boolean  | 判断是否是开发环境 |



### MidwayConfigService

Midway 内置的多环境配置服务，提供配置的加载，获取，它也是 `@Config` 装饰器的数据源。

可以通过注入获取。

```typescript
import { Inject, Controller, Get } from '@midwayjs/decorator';
import { MidwayEnvironmentService } from '@midwayjs/core';

@Controller('/')
export class HomeController {

  @Inject()
  configService: MidwayConfigService;

  @Get('/')
  async home() {
    // this.configService.getConfiguration();
  }
}
```

一般用来获取当前的配置，API 如下：

| API                | 返回类型 | 描述                     |
| ------------------ | -------- | ------------------------ |
| addObject(obj)     |          | 动态添加配置对象         |
| getConfiguration() | Object   | 返回当前合并好的配置对象 |
| clearAllConfig()   |          | 清空所有配置             |



### MidwayLoggerService

Midway 内置的日志服务，提供日志创建，获取等 API，它也是 `@Logger` 装饰器的数据源。

可以通过注入获取。

```typescript
import { Inject, Controller, Get } from '@midwayjs/decorator';
import { MidwayEnvironmentService } from '@midwayjs/core';

@Controller('/')
export class HomeController {

  @Inject()
  loggerService: MidwayLoggerService;

  @Get('/')
  async home() {
    // this.loggerService.getLogger('logger');
  }
}
```

一般用来获取日志对象，API 如下：

| API                          | 返回类型 | 描述                           |
| ---------------------------- | -------- | ------------------------------ |
| createInstance(name, config) | ILogger  | 动态创建一个 Logger 实例       |
| getLogger(name)              | ILogger  | 根据日志名返回一个 Logger 实例 |



### MidwayFrameworkService

Midway 内置的自定义框架服务，配合组件中自定义的 `@Framework` 标记的 Class，提供不同协议的对外服务。

可以通过注入获取。

```typescript
import { Inject, Controller, Get } from '@midwayjs/decorator';
import { MidwayEnvironmentService } from '@midwayjs/core';

@Controller('/')
export class HomeController {

  @Inject()
  frameworkService: MidwayFrameworkService;

  @Get('/')
  async home() {
    // this.frameworkService.getMainFramework();
  }
}
```

一般用来获取 Framework 对象，API 如下：

| API                               | 返回类型           | 描述                               |
| --------------------------------- | ------------------ | ---------------------------------- |
| getMainFramework()                | IMidwayFramework   | 返回主框架实例                     |
| getMainApp()                      | IMidwayApplication | 返回主框架中的 app 对象            |
| getFramework(nameOrFrameworkType) | IMidwayFramework   | 根据框架名或者框架类型返回框架实例 |



### MidwayMiddlewareService

Midway 内置的中间件处理服务，用于自建中间件的处理。

Midway 内置的自定义装饰器服务，用于实现框架层面的自定义装饰器，一般在自定义框架时使用。

可以通过注入获取。

```typescript
import { Inject, Controller, Get } from '@midwayjs/decorator';
import { MidwayAspectService } from '@midwayjs/core';

@Controller('/')
export class HomeController {

  @Inject()
  middlewareService: MidwayMiddlewareService;

  @Get('/')
  async home() {
    // this.middlewareService.compose(/** 省略 **/);
  }
}
```

API 如下：

| API                              | 返回类型    | 描述                                         |
| -------------------------------- | ----------- | -------------------------------------------- |
| compose(middlewares, app, name?) | IMiddleawre | 将多个中间件数组组合到一起返回一个新的中间件 |



### MidwayDecoratorService

Midway 内置的自定义装饰器服务，用于实现框架层面的自定义装饰器。

可以通过注入获取。

```typescript
import { Inject, Controller, Get } from '@midwayjs/decorator';
import { MidwayAspectService } from '@midwayjs/core';

@Controller('/')
export class HomeController {

  @Inject()
  decoratorService: MidwayDecoratorService;

  @Get('/')
  async home() {
    // this.decoratorService.registerPropertyHandler(/** 省略 **/);
  }
}
```

API 如下：

| API                                             | 返回类型 | 描述                   |
| ----------------------------------------------- | -------- | ---------------------- |
| registerPropertyHandler(decoratorKey, handler)  |          | 添加一个属性装饰器实现 |
| registerMethodHandlerr(decoratorKey, handler)   |          | 添加一个方法装饰器实现 |
| registerParameterHandler(decoratorKey, handler) |          | 添加一个参数装饰器实现 |

具体示例，请参考 **自定义装饰器** 部分。



### MidwayAspectService

Midway 内置的拦截器服务，用于加载 `@Aspect` 相关的能力，自定义装饰器也使用了该服务。

可以通过注入获取。

```typescript
import { Inject, Controller, Get } from '@midwayjs/decorator';
import { MidwayAspectService } from '@midwayjs/core';

@Controller('/')
export class HomeController {

  @Inject()
  lifeCycleService: MidwayLifeCycleService;

  @Get('/')
  async home() {
    // this.aspectService.interceptPrototypeMethod(/** 省略 **/);
  }
}
```

API 如下：

| API                                                          | 返回类型 | 描述                                     |
| ------------------------------------------------------------ | -------- | ---------------------------------------- |
| addAspect(aspectInstance, aspectData)                        |          | 添加一个拦截器实现                       |
| interceptPrototypeMethod(Clazz, methodName, aspectObject: IMethodAspect) |          | 拦截原型上的方法，将拦截器的实现添加上去 |



### MidwayLifeCycleService

Midway 内置的生命周期运行服务，用于运行 `configuration` 中的生命周期。

该服务均为内部方法，用户无法直接使用。
