# Built-in service

In Midway, many built-in objects are provided for the convenience of users.

In this section, we will introduce the Application associated with the framework, Context objects, and some service objects on Midway default containers, which are often encountered in the entire business development.

The following are some services built into the Midway dependency injection container. These services are initialized by the dependency injection container and are globally available in the business.



## MidwayApplicationManager

Midway's built-in application manager can be used to get all the Application.

It can be obtained by injection, such as adding the same middleware to different applications.

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

| API | return type | Description |
| ------------------------------------ | -------------------- | ------------------------------------------------------ |
| getFramework(namespace: string) | IMidwayFramework | Returns the framework specified by the parameter |
| getApplication(namespace: string) | IMidwayApplication | Returns the Application specified by the parameter |
| getApplications(namespace: string[]) | IMidwayApplication[] | Returns multiple Application specified by the parameter |
| getWebLikeApplication() | IMidwayApplication [] | Returns Application similar to Web scenarios (express/koa/egg/faas) |



## MidwayInformationService

Midway's built-in information service provides basic project data.

It can be obtained by injection.

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

Generally used to return user-related directories.

| API | Return type | Description |
| ------------ | -------- | ------------------------------------------------------- |
| getAppDir() | String | Return to the application root directory |
| getBaseDir() | String | Returns the application code directory. By default, the local development is src and the server running is dist. |
| getHome | String | Return to the machine user directory, which refers to the address.  |
| getPkg | Object | Returns the contents of the package.json |
| getRoot | String | In the development environment, return to appDir, and in other environments, return to the Home directory. |



## MidwayEnvironmentService

Midway's built-in environmental services provide environmental settings and judgments.

It can be obtained by injection.

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

Generally used to obtain the current environment, the API is as follows:

| API | Return type | Description |
| ------------------------ | -------- | ------------------ |
| getCurrentEnvironment() | String | Return to Apply Current Environment |
| setCurrentEnvironment() |          | Set current environment |
| isDevelopmentEnvironment | Boolean | Judging whether it is a development environment |



## MidwayConfigService

Midway's built-in multi-environment configuration service provides the loading and obtaining of configurations. It is also the data source of the `@Config` decorator.

It can be obtained by injection.

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

Generally used to obtain the current configuration, the API is as follows:

| API | Return type | Description |
| ------------------ | -------- | ------------------------ |
| addObject(obj) |          | Dynamically add configuration objects |
| getConfiguration() | Object | Returns the currently merged configuration object |
| clearAllConfig() |          | Clear all configurations |



## MidwayLoggerService

The built-in log service of Midway provides API operations such as log creation and retrieval. It is also the data source of the `@Logger` decorator.

It can be obtained by injection.

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

Generally, it is used to obtain log objects. The API is as follows:

| API | Return type | Description |
| ---------------------------- | -------- | ------------------------------ |
| createInstance(name, config) | ILogger | Dynamically create a Logger instance |
| getLogger(name) | ILogger | Returns a Logger instance based on the log name. |



## MidwayFrameworkService

Midway's built-in custom framework service, combined with the custom `@Framework` marked Class in the component, provides external services of different protocols.

It can be obtained by injection.

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

Generally used to obtain Framework objects, the API is as follows:

| API | return type | Description |
| --------------------------------- | ------------------ | ---------------------------------- |
| getMainFramework() | IMidwayFramework | Returns the main frame instance |
| getMainApp() | IMidwayApplication | Returns the app object in the main frame |
| getFramework(nameOrFrameworkType) | IMidwayFramework | Returns a frame instance based on the frame name or frame type |



## MidwayMiddlewareService

Midway's built-in middleware processing service is used for the processing of self-built middleware.

Midway's built-in custom decorator service is used to implement frame-level custom decorators, which are generally used when customizing frames.

It can be obtained by injection.

```typescript
import { Inject, Controller, Get } from '@midwayjs/decorator';
import { MidwayMiddlewareService } from '@midwayjs/core';

@Controller('/')
export class HomeController {

  @Inject()
  middlewareService: MidwayMiddlewareService;

  @Get('/')
  async home() {
    // this.middlewareService.com pose(/**omitted**/);
  }
}
```

The API is as follows:

| API | return type | Description |
| -------------------------------- | ----------- | -------------------------------------------- |
| compose(middlewares, app, name?) | IMiddleawre | Combine multiple middleware arrays together to return a new middleware |



## MidwayDecoratorService

Midway's built-in custom decorator service is used to implement custom decorators at the frame level.

It can be obtained by injection.

```typescript
import { Inject, Controller, Get } from '@midwayjs/decorator';
import { MidwayDecoratorService } from '@midwayjs/core';

@Controller('/')
export class HomeController {

  @Inject()
  decoratorService: MidwayDecoratorService;

  @Get('/')
  async home() {
    // this.decoratorService.registerPropertyHandler(/* omitted */);
  }
}
```

The API is as follows:

| API | return type | Description |
| ----------------------------------------------- | -------- | ---------------------- |
| registerPropertyHandler(decoratorKey, handler) |          | Add a property decorator implementation |
| registerMethodHandler(decoratorKey, handler) |          | Add a method decorator implementation |
| registerParameterHandler(decoratorKey, handler) |          | Add a parameter decorator implementation |

For more information, see **Custom decorator**.



## MidwayAspectService

Midway's built-in interceptor service is used to load `@Aspect` related capabilities. Custom decorators also use this service.

It can be obtained by injection.

```typescript
import { Inject, Controller, Get } from '@midwayjs/decorator';
import { MidwayAspectService } from '@midwayjs/core';

@Controller('/')
export class HomeController {

  @Inject()
  aspectService: MidwayAspectService;

  @Get('/')
  async home() {
    // this.aspectService.interceptPrototypeMethod(/* omitted */);
  }
}
```

The API is as follows:

| API | Return type | Description |
| ------------------------------------------------------------------------ | -------- | ---------------------------------------- |
| addAspect(aspectInstance, aspectData) |          | Add an interceptor implementation |
| interceptPrototypeMethod(Clazz, methodName, aspectObject: IMethodAspect) |          | The method on the interception prototype is added to the implementation of the interceptor. |



## MidwayLifeCycleService

Midway's built-in lifecycle run service is used to run the lifecycle in the `configuration`.

This service is an internal method and cannot be used directly by users.



## MidwayMockService

Midway's built-in data simulation service is used to simulate data during development and single test.

It can be obtained by injection.

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

API is as follows

| API | Return type | Description |
| -------------------------------------------- | -------- | ---------------------------------- |
| mockClassProperty(clzz, propertyName, value) |          | Mock a property on a class (method) |
| mockProperty(obj, key, value) |          | Mock a property (method) on a normal object |
| mockContext(app, key, vlue) |          | Properties on mock Context Objects |
| restore() |          | Empty all mock data |


### mockClassProperty

Used to simulate a property or method of a class.

Like a class.

```typescript
@Provide()
export class UserService {
  data;

  async getUser() {
    return 'hello';
  }
}
```

We can also simulate in code.

```typescript

import { Provide, Inject } from '@middwayjs/decorator';
import { MidwayMockService } from '@midwayjs/core';

@Provide()
class TestMockService {
  @Inject()
  mockService: MidwayMockService;

  mock() {
    // Simulation method
    this.mockService.mockClassProperty(UserService, 'getUser', async () => {
      return 'midway';
    });

    // Simulation properties
    this.mockService.mockClassProperty(UserService, 'data', {
      bbb: '1'
    });
  }
}
```



### mockProperty

Use `mockProperty` methods to simulate the properties of objects.

```typescript
import { Provide, Inject } from '@middwayjs/decorator';
import { MidwayMockService } from '@midwayjs/core';

@Provide()
class TestMockService {
  @Inject()
  mockService: MidwayMockService;

  mock() {
    const a = {};
    // Simulation properties
    this.mockService.mockProperty(a, 'name', 'hello');
    // a['name'] => 'hello'

    // Simulation method
    this.mockService.mockProperty(a, 'getUser', async () => {
      return 'midway';
    });
    // await a.getUser() => 'midway'
  }
}

```



### mockContext

Since Midway's Context is associated with app, app instances need to be passed in during simulation.

`mockContext` methods are used to simulate the context.

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
    // Simulation context
    mockContext(app, 'user', 'midway');
  }
}

// ctx.user => midway
```

If your data is complex or logical, you can also use the callback form.

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
    // Simulation context
    mockContext(app, (ctx) => {
      ctx.user = 'midway';
    });
  }
}

// ctx.user => midway
```

Note that this mock behavior is executed before all middleware.



## MidwayWebRouterService

Midway's built-in routing table service is used to apply routing and function creation.

It can be obtained by injection.

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

API is as follows

| API | Return type | Description |
| ------------------------------------------------- | ---------------------------------- | -------------------------------------- |
| addController(controllerClz, controllerOption) |                                    | Dynamically add a Controller |
| addRouter(routerFunction, routerInfoOption) |                                    | Dynamically add a routing function |
| getRouterTable() | Promise<Map<string, RouterInfo [] >> | Get hierarchical routes |
| getFlattenRouterTable() | Promise<RouterInfo [] > | Get a list of flat routes |
| getRoutePriorityList() | Promise<RouterPriority [] > | Get the route prefix list |
| getMatchedRouterInfo(url: string, method: string) | Promise<RouterInfo \| undefined> | Returns the current matching route information based on the access path. |

For more information, see [Web route table](# router_table).



## MidwayServerlessFunctionService

Midway's built-in function information service inherits and `MidwayWebRouterService` in almost the same way.

It can be obtained by injection.

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
      type: ServerlessTriggerType.HTTP
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

API is as follows

| API | Return type | Description |
| ---------------------------------------------------------- | --------------------- | ---------------- |
| addServerlessFunction(fn, triggerOptions, functionOptions) |                       | Dynamically add a function |
| getFunctionList() | Promise<RouterInfo [] > | Get a list of all functions |

For more information, see [Web route table](# router_table).

