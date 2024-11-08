# Built-in service

In Midway, many built-in objects are provided for the convenience of users.

In this section, we will introduce the Application associated with the framework, Context objects, and some service objects on Midway default containers, which are often encountered in the entire business development.

The following are some services built into the Midway dependency injection container. These services are initialized by the dependency injection container and are globally available in the business.



## MidwayApplicationManager

Midway's built-in application manager can be used to get all the Application.

It can be obtained by injection, such as adding the same middleware to different applications.

```typescript
import { MidwayApplicationManager, Configuration, Inject } from '@midwayjs/core';
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
import { MidwayInformationService, Inject, Controller, Get } from '@midwayjs/core';

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
import { MidwayEnvironmentService, Inject, Controller, Get } from '@midwayjs/core';

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
import { MidwayConfigService, Inject, Controller, Get } from '@midwayjs/core';

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
import { MidwayLoggerService, Inject, Controller, Get } from '@midwayjs/core';

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
import { MidwayFrameworkService, Inject, Controller, Get } from '@midwayjs/core';

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
import { MidwayMiddlewareService, Inject, Controller, Get } from '@midwayjs/core';

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
import { MidwayDecoratorService, Inject, Controller, Get } from '@midwayjs/core';

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
import { MidwayAspectService, Inject, Controller, Get } from '@midwayjs/core';

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

Midway's built-in data simulation service is used to simulate data during development and testing.

It can be obtained by injection.

```typescript
import { MidwayMockService, Inject, Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {

  @Inject()
  mockService: MidwayMockService;

  @Get('/')
  async home() {
    // this.mockService.mockProperty(/** omitted **/);
  }
}
```

API is as follows

| API                                          | Return type | Description                               |
| -------------------------------------------- | ----------- | ----------------------------------------- |
| mockClassProperty(clzz, propertyName, value, group?) |             | Mock a property (method) on a class, supports grouping, default group is `default` |
| mockProperty(obj, key, value, group?)        |             | Mock a property (method) on a normal object, supports grouping, default group is `default` |
| mockContext(app, key, value, group?)         |             | Mock properties on context objects, supports grouping, default group is `default` |
| restore(group?)                              |             | Restore mock data for the specified group, restore all if not specified |
| restoreAll()                                 |             | Clear all mock data                       |

### mockClassProperty

Used to simulate a property or method of a class. Supports specifying a group through the `group` parameter. If the `group` parameter is not passed, the default group `default` is used.

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
import { MidwayMockService, Provide, Inject } from '@midwayjs/core';

@Provide()
class TestMockService {
  @Inject()
  mockService: MidwayMockService;

  mock() {
    // Simulate property, use default group
    this.mockService.mockClassProperty(UserService, 'getUser', async () => {
      return 'midway';
    });

    // Simulate property, specify group
    this.mockService.mockClassProperty(UserService, 'data', {
      bbb: '1'
    }, 'group2');
  }
}
```

### mockProperty

Use the `mockProperty` method to simulate the properties of objects. Supports specifying a group through the `group` parameter.

```typescript
import { MidwayMockService, Provide, Inject } from '@midwayjs/core';

@Provide()
class TestMockService {
  @Inject()
  mockService: MidwayMockService;

  mock() {
    const a = {};
    // Default group
    this.mockService.mockProperty(a, 'name', 'hello');
    // Simulate property, custom group
    this.mockService.mockProperty(a, 'name', 'hello', 'group1');
    // a['name'] => 'hello'

    // Simulate method
    this.mockService.mockProperty(a, 'getUser', async () => {
      return 'midway';
    }, 'group2');
    // await a.getUser() => 'midway'
  }
}
```

### mockContext

Since Midway's Context is associated with app, app instances need to be passed in during simulation. Supports specifying a group through the `group` parameter.

Use the `mockContext` method to simulate the context.

```typescript
import { MidwayMockService, Configuration, App } from '@midwayjs/core';

@Configuration(/**/)
export class MainConfiguration {
  @Inject()
  mockService: MidwayMockService;

  @App()
  app;

  async onReady() {
    // Simulate context, default group
    this.mockService.mockContext(app, 'user', 'midway');
    // Custom group
    this.mockService.mockContext(app, 'user', 'midway', 'group1');
  }
}

// ctx.user => midway
```

If your data is complex or logical, you can also use the callback form.

```typescript
import { MidwayMockService, Configuration, App } from '@midwayjs/core';

@Configuration(/**/)
export class MainConfiguration {
  @Inject()
  mockService: MidwayMockService;

  @App()
  app;

  async onReady() {
    // Simulate context
    this.mockService.mockContext(app, (ctx) => {
      ctx.user = 'midway';
    }, 'group2');
  }
}

// ctx.user => midway
```

Note that this mock behavior is executed before all middleware.



## MidwayWebRouterService

Midway's built-in routing table service is used to apply routing and function creation.

It can be obtained by injection.

```typescript
import { MidwayWebRouterService, Configuration, Inject } from '@midwayjs/core';

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
import { MidwayServerlessFunctionService, Configuration, Inject } from '@midwayjs/core';

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

API is as follows

| API | Return type | Description |
| ---------------------------------------------------------- | --------------------- | ---------------- |
| addServerlessFunction(fn, triggerOptions, functionOptions) |                       | Dynamically add a function |
| getFunctionList() | Promise<RouterInfo [] > | Get a list of all functions |

For more information, see [Web route table](# router_table).



## MidwayHealthService

Midway's built-in health check execution service is used for externally extended health check capabilities.

A complete health check consists of two parts:

* 1. The trigger end of the health check, such as an external scheduled request, is usually an Http interface
* 2. The execution end of the health check usually checks whether specific items are normal in each component or business.

`MidwayHealthService` is generally used as the trigger end of health check. The content described below is generally implemented on the trigger end.

It can be obtained through injection and then perform health check tasks.

```typescript
import { MidwayHealthService, Configuration, Inject } from '@midwayjs/core';

@Configuration({
  // ...
})
export class MainConfiguration {
  @Inject()
  healthService: MidwayHealthService;

  async onServerReady() {
    setInterval(() => {
      const results = await this.healthService.getStatus();
      
      // console.log(results);
      // =>
      // {
      //   "status": false
      //   "namespace": "redis",
      //   "reason": "health check timeout",
      //   "results": [
      //      {
      //        "status": false
      //        "reason": "health check timeout",
      //        "namespace": "redis"
      //      }
      //    ]
      // }
      
    }, 1000);
    // ...
  }
}
```

The API is as follows

| API                              | Return Type             | Description                |
| -------------------------------- |-------------------------| -------------------------- |
| getStatus()                      | Promise<HealthResults\> | Dynamically add a function |
| setCheckTimeout(timeout: number) | void                    | Set timeout                |

The `getStatus` method is used to externally call the `onHealthCheck` method in polling `configuration` and return a data that conforms to the `HealthResults` structure.

  `HealthResults` contains several fields. `status` indicates whether the check is successful. If it fails, `reason` indicates the reason for the first failed component. `namespace` represents the name of the first failed component. `results` It means that all the returned items are checked this time, and the structure of the returned items is the same as the external one.

When executing the process, if the following conditions occur in the `onHealthCheck` method, it will be marked as failed.

* 1. No data conforming to the `HealthResult` structure was returned.
* 2. No value returned
* 3. Execution timeout
* 4. Throw an error
* 5. Return error data that conforms to the `HealthResult` structure, such as `{status: false}`

The default waiting timeout for health checks is 1s.

Can be overridden using global configuration.

```typescript
//config.default
export default {
   core: {
     healthCheckTimeout: 2000,
   }
};
```

The execution end of the health check is implemented in the life cycle of the business or component. For details, please see [Life Cycle](/docs/lifecycle#onhealthcheck).
