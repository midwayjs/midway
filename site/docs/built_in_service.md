# 内置服务

在 Midway 中，提供了众多的内置对象，方便用户使用。

在本章节，我们会介绍和框架相关联的的 Application，Context 对象，Midway 默认容器上的一些服务对象，这些对象在整个业务的开发中都会经常遇到。

以下是一些 Midway 依赖注入容器内置的服务，这些服务由依赖注入容器初始化，在业务中全局可用。



## MidwayApplicationManager

Midway 内置的应用管理器，可以使用它获取到所有的 Application。

可以通过注入获取，比如对不同的 Application 添加同一个中间件。

```typescript
import { MidwayApplicationManager } from '@midwayjs/core'
import { Configuration, Inject } from '@midawyjs/decorator';
import { CustomMiddleware } from './middleware/custom.middleware';

@Configuration({
  // ...
})
export class MainConfiguration {
  @Inject()
  applicationManager: MidwayApplicationManager;

  async onReady() {
    this.applicationManager
      .getApplications(['koa', 'faas', 'express', 'egg'])
      .forEach(app => {
        app.useMiddleware(CustomMiddleware);
      });
  }
}

```

| API                                  | 返回类型             | 描述                                                   |
| ------------------------------------ | -------------------- | ------------------------------------------------------ |
| getFramework(namespace: string)      | IMidwayFramework     | 返回参数指定的 framework                               |
| getApplication(namespace: string)    | IMidwayApplication   | 返回参数指定的 Application                             |
| getApplications(namespace: string[]) | IMidwayApplication[] | 返回参数指定的多个 Application                         |
| getWebLikeApplication()              | IMidwayApplication[] | 返回类似 Web 场景的 Application（express/koa/egg/faas) |



## MidwayInformationService

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



## MidwayEnvironmentService

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



## MidwayConfigService

Midway 内置的多环境配置服务，提供配置的加载，获取，它也是 `@Config` 装饰器的数据源。

可以通过注入获取。

```typescript
import { Inject, Controller, Get } from '@midwayjs/decorator';
import { MidwayConfigService } from '@midwayjs/core';

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



## MidwayLoggerService

Midway 内置的日志服务，提供日志创建，获取等 API，它也是 `@Logger` 装饰器的数据源。

可以通过注入获取。

```typescript
import { Inject, Controller, Get } from '@midwayjs/decorator';
import { MidwayLoggerService } from '@midwayjs/core';

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



## MidwayFrameworkService

Midway 内置的自定义框架服务，配合组件中自定义的 `@Framework` 标记的 Class，提供不同协议的对外服务。

可以通过注入获取。

```typescript
import { Inject, Controller, Get } from '@midwayjs/decorator';
import { MidwayFrameworkService } from '@midwayjs/core';

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



## MidwayMiddlewareService

Midway 内置的中间件处理服务，用于自建中间件的处理。

Midway 内置的自定义装饰器服务，用于实现框架层面的自定义装饰器，一般在自定义框架时使用。

可以通过注入获取。

```typescript
import { Inject, Controller, Get } from '@midwayjs/decorator';
import { MidwayMiddlewareService } from '@midwayjs/core';

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



## MidwayDecoratorService

Midway 内置的自定义装饰器服务，用于实现框架层面的自定义装饰器。

可以通过注入获取。

```typescript
import { Inject, Controller, Get } from '@midwayjs/decorator';
import { MidwayDecoratorService } from '@midwayjs/core';

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
| registerMethodHandler(decoratorKey, handler)    |          | 添加一个方法装饰器实现 |
| registerParameterHandler(decoratorKey, handler) |          | 添加一个参数装饰器实现 |

具体示例，请参考 **自定义装饰器** 部分。



## MidwayAspectService

Midway 内置的拦截器服务，用于加载 `@Aspect` 相关的能力，自定义装饰器也使用了该服务。

可以通过注入获取。

```typescript
import { Inject, Controller, Get } from '@midwayjs/decorator';
import { MidwayAspectService } from '@midwayjs/core';

@Controller('/')
export class HomeController {

  @Inject()
  aspectService: MidwayAspectService;

  @Get('/')
  async home() {
    // this.aspectService.interceptPrototypeMethod(/** 省略 **/);
  }
}
```

API 如下：

| API                                                                      | 返回类型 | 描述                                     |
| ------------------------------------------------------------------------ | -------- | ---------------------------------------- |
| addAspect(aspectInstance, aspectData)                                    |          | 添加一个拦截器实现                       |
| interceptPrototypeMethod(Clazz, methodName, aspectObject: IMethodAspect) |          | 拦截原型上的方法，将拦截器的实现添加上去 |



## MidwayLifeCycleService

Midway 内置的生命周期运行服务，用于运行 `configuration` 中的生命周期。

该服务均为内部方法，用户无法直接使用。



## MidwayMockService

Midway 内置的数据模拟服务，用于在开发和单测时模拟数据。

可以通过注入获取。

```typescript
import { Inject, Controller, Get } from '@midwayjs/decorator';
import { MidwayMockService } from '@midwayjs/core';

@Controller('/')
export class HomeController {

  @Inject()
  mockService: MidwayMockService;

  @Get('/')
  async home() {
    // this.mockService.mockProperty(/** 省略 **/);
  }
}
```

API 如下

| API                                          | 返回类型 | 描述                               |
| -------------------------------------------- | -------- | ---------------------------------- |
| mockClassProperty(clzz, propertyName, value) |          | mock 一个class 上的属性（方法 ）   |
| mockProperty(obj, key, value)                |          | mock 一个普通对象上的属性（方法 ） |
| mockContext(app, key, vlue)                  |          | mock 上下文对象上的属性            |
| restore()                                    |          | 清空所有 mock 数据                 |


### mockClassProperty

用于模拟类的某个属性或者方法。

比如某个类。

```typescript
@Provide()
export class UserService {
  data;

  async getUser() {
    return 'hello';
  }
}
```

我们也可以在代码中模拟。

```typescript

import { Provide, Inject } from '@middwayjs/decorator';
import { MidwayMockService } from '@midwayjs/core';

@Provide()
class TestMockService {
  @Inject()
  mockService: MidwayMockService;

  mock() {
    // 模拟方法
    this.mockService.mockClassProperty(UserService, 'getUser', async () => {
      return 'midway';
    });

    // 模拟属性
    this.mockService.mockClassProperty(UserService, 'data', {
      bbb: '1'
    });
  }
}
```



### mockProperty

使用 `mockProperty` 方法来模拟对象的属性。

```typescript
import { Provide, Inject } from '@middwayjs/decorator';
import { MidwayMockService } from '@midwayjs/core';

@Provide()
class TestMockService {
  @Inject()
  mockService: MidwayMockService;

  mock() {
    const a = {};
    // 模拟属性
    this.mockService.mockProperty(a, 'name', 'hello');
    // a['name'] => 'hello'

    // 模拟方法
    this.mockService.mockProperty(a, 'getUser', async () => {
      return 'midway';
    });
    // await a.getUser() => 'midway'
  }
}

```



### mockContext

由于 Midway 的 Context 和 app 关联，所以在模拟的时候需要传入 app 实例。

使用 `mockContext` 方法来模拟上下文。

```typescript
import { Configuration, App } from '@middwayjs/decorator';
import { MidwayMockService } from '@midwayjs/core';

@Configuration(/**/)
export class AutoConfiguration {
  @Inject()
  mockService: MidwayMockService;

  @App()
  app;

  async onReady() {
    // 模拟上下文
    mockContext(app, 'user', 'midway');
  }
}

// ctx.user => midway
```

如果你的数据比较复杂，或者带有逻辑，也可以使用回调形式。

```typescript
import { Configuration, App } from '@middwayjs/decorator';
import { MidwayMockService } from '@midwayjs/core';

@Configuration(/**/)
export class AutoConfiguration {
  @Inject()
  mockService: MidwayMockService;

  @App()
  app;

  async onReady() {
    // 模拟上下文
    mockContext(app, (ctx) => {
      ctx.user = 'midway';
    });
  }
}

// ctx.user => midway
```

注意，这个 mock 行为是在所有中间件之前执行。



## MidwayWebRouterService

Midway 内置的路由表服务，用于应用路由和函数的创建。

可以通过注入获取。

```typescript
import { MidwayWebRouterService } from '@midwayjs/core';
import { Configuration, Inject } from '@midawyjs/decorator';

@Configuration({
  // ...
})
export class MainConfiguration {
  @Inject()
  webRouterService: MidwayWebRouterService;

  async onReady() {
    this.webRouterService.addRouter(async (ctx) => {
      return 'hello world';
    }, {
      url: '/',
      requestMethod: 'GET',
    });
  }
}

```

API 如下

| API                                               | 返回类型                           | 描述                                   |
| ------------------------------------------------- | ---------------------------------- | -------------------------------------- |
| addController(controllerClz, controllerOption)    |                                    | 动态添加一个 Controller                |
| addRouter(routerFunction, routerInfoOption)       |                                    | 动态添加一个路由函数                   |
| getRouterTable()                                  | Promise<Map<string, RouterInfo[]>> | 获取带层级的路由                       |
| getFlattenRouterTable()                           | Promise<RouterInfo[]>              | 获取扁平化路由列表                     |
| getRoutePriorityList()                            | Promise<RouterPriority[]>          | 获取路由前缀列表                       |
| getMatchedRouterInfo(url: string, method: string) | Promise<RouterInfo \| undefined>   | 根据访问的路径，返回当前匹配的路由信息 |

更多使用请参考 [Web 路由表](#router_table)。



## MidwayServerlessFunctionService

Midway 内置的函数信息服务，继承与 `MidwayWebRouterService` ，方法几乎相同。

可以通过注入获取。

```typescript
import { MidwayServerlessFunctionService } from '@midwayjs/core';
import { Configuration, Inject } from '@midawyjs/decorator';

@Configuration({
  // ...
})
export class MainConfiguration {
  @Inject()
  serverlessFunctionService: MidwayServerlessFunctionService;

  async onReady() {
    this.serverlessFunctionService.addServerlessFunction(async (ctx, event) => {
      return 'hello world';
    }, {
      type: ServerlessTriggerType.HTTP,
      metadata: {
        method: 'get',
        path: '/api/hello'
      },
      functionName: 'hello',
      handlerName: 'index.hello',
    });
  }
}

```

API 如下

| API                                                        | 返回类型              | 描述             |
| ---------------------------------------------------------- | --------------------- | ---------------- |
| addServerlessFunction(fn, triggerOptions, functionOptions) |                       | 动态添加一个函数 |
| getFunctionList()                                          | Promise<RouterInfo[]> | 获取所有函数列表 |

更多使用请参考 [Web 路由表](#router_table)。

