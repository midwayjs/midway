# Application and Context

Midway's application will expose different protocols, such as Http,WebSocket, etc. Each protocol here is provided by an independent component for Midway.

For example, `@midwayjs/koa` in our previous example is a component that provides Http services. We will take this component as an example to introduce built-in objects.

Each Web framework used will provide its own unique capabilities, which will be reflected in its own **context** (Context) and **application** (Application).



## Defining conventions

In order to simplify the use, all components of the exposure protocol will export **context** (Context) and **application** (Application) definitions, and we are consistent. That is, `Context` and `Application`.

For example:

```typescript
import { Application, Context } from '@midwayjs/koa';
import { Application, Context } from '@midwayjs/express';
import { Application, Context } from '@midwayjs/web';
```

And non-Web framework, we have also maintained the same.

```typescript
import { Application, Context } from '@midwayjs/socketio';
import { Application, Context } from '@midwayjs/grpc';
import { Application, Context } from '@midwayjs/rabbitmq';
```



## Application

Application is the application object in a component, and may have different implementations in different components. The Application object will contain some unified methods, which are unified from the `IMidwayApplication` definition.

```typescript
import { Application } from '@midwayjs/koa';
```



### How to get

In all classes that depend on injection container management, the `@App()` decorator can be used to obtain the **current most important** Application.

For example:

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

The protocols exposed by Midway applications are brought by components, and each component will expose the Application objects corresponding to its own protocol.

This means that there will be multiple Application in an application. By default, we agree that the first Application introduced in `src/configuration.ts` is the **Main Application** (the **main Application** ).

For example, the **Main Application** is the Application instance in the following KOA (the **main Application** ).

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

In fact, Application all implement interfaces with `IMidwayApplication`. If we use a common API, there is no difference.

Being a Main Application has some advantages:

- In most scenarios, you can use `@App()` to inject and obtain
- Priority initialization

For example, when multiple export Application components need to load middleware, they can be simply coded.

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

  @App(MidwayFrameworkType.WS)
  wsApp: ws.Application;

  async onReady() {
    this.koaApp.useMiddleweare(...);
    this.wsApp.useMiddleweare(...);
  }
}
```

Non-primary Application need to be obtained through the parameters or [ApplicationManager](./built_in_service#midwayapplicationmanager) of the `@App()` decorator.

The parameter of the `@App()` decorator is the `namespace` of the component.

Common namespaces are as follows:

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

Used to get the project root directory path.

```typescript
this.app.getAppDir();
// => /my_project
```



### getBaseDir

It is used to obtain the basic path of the project TypeScript. By default, it is the `src` directory in development and the `dist` directory after compilation.

```typescript
this.app.getBaseDir();
// => /my_project/src
```



### getEnv

Gets the current project environment.

```typescript
this.app.getEnv();
// => production
```



### getApplicationContext

Gets the current global dependency injection container.

```typescript
this.app.getApplicationContext();
```



### getConfig

Get the configuration.

```typescript
// Get all configurations
this.app.getConfig();
// Get specific key configuration
this.app.getConfig('koa');
// Obtain multi-level configuration
this.app.getConfig('midwayLoggers.default.dir');
```



### getLogger

Obtain a Logger, do not pass parameters, and return appLogger by default.

```typescript
this.app.getLogger();
// => app logger
this.app.getLogger('custom');
// => custom logger
```



### getCoreLogger

Get Core Logger.

```typescript
this.app.getCoreLogger();
```



### getFrameworkType

Gets the current frame type.

```typescript
this.app.getFrameworkType();
// => MidwayFrameworkType.WEB_KOA
```



### getProjectName

The project name is obtained from the `package.json`.



### setAttr & getAttr

Mount an object directly on the Application can cause difficulty in defining and maintaining it.

In most cases, what users need is a temporary global data storage method, such as temporarily accessing a data across files within an application or component, saving from one class and obtaining it from another class.

For this reason, Midway provides an API for global data access to solve such requirements.

```typescript
this.app.setAttr('abc', {
  a: 1
  B: 2
});
```

Get it in another place.

```typescript
const value = this.app.getAttr('abc');
console.log(value);
// { a: 1, B: 2}
```



## Context

A Context is a **request-level object**. Each time a user request is received, the framework instantiates a Context object,

In Http scenarios, this object encapsulates the information requested by the user this time, or other methods for obtaining request parameters and setting response information. In scenarios such as WebSocket and Rabbitmq, Context also have their own attributes, subject to the definition of the framework.

The following API is a common attribute or interface for each context implementation.



### How to get


In the **default request scope**, that is, in the controller (Controller) or common service (Service), we can use `@Inject` to inject the corresponding instance.


for example, you can obtain the corresponding ctx instance in this way.

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

In addition to explicit declarations, when the interceptor or decorator is designed, because we cannot know whether the user has written the ctx attribute, we can also obtain it through the built-in `REQUEST_ OBJ_CTX_KEY` field.

For example:

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

Midway mounts a `requestContext` attribute for each Context, a dependency injection container under the request scope, which is used to create objects under the request scope.

```typescript
const userService = await this.ctx.requestContext.getAsync(UserService);
// ...
```



### logger

The default logger object under the request scope, which contains context data.

```typescript
this.ctx.logger.info('xxxx');
```



### startTime

The time when context execution starts.

```typescript
this.ctx.startTime
// 1642820640502
```



### setAttr & getAttr

The method is the same as that used in `app`. The data of these methods is stored in the request link. As the request is destroyed, you can put some temporary data of the request in it.

```typescript
this.ctx.setAttr('abc', {
  a: 1
  B: 2
});
```

Get it in another place.

```typescript
const value = this.ctx.getAttr('abc');
console.log(value);
// { a: 1, B: 2}
```



### getLogger

Gets the context log of a custom Logger.

```typescript
this.ctx.getLogger('custom');
// => custom logger
```

