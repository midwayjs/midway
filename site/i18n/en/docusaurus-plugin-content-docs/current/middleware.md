# Web middleware

Web middleware is a function called **before** and after (partially).  Middleware functions can access request and response objects.
![image.png](https://img.alicdn.com/imgextra/i1/O1CN01h6hYvW1ogNexjJ3Nl_!!6000000005254-2-tps-2196-438.png)


Different upper-layer web frameworks have different middleware forms. Midway standard middleware is based on the [onion ring model](https://eggjs.org/zh-cn/intro/egg-and-koa.html#midlleware). Express, on the other hand, is a traditional queue model.


Koa and EggJs can be executed** before and after the **controller. In Express, the middleware can **only be called before** the controller, which will be introduced separately in Express chapters.

For the following code, we will take `@midwayjs/koa` as an example.




## Writing middleware


In general, we will write Web middleware in the `src/middleware` folder.


Create a `src/middleware/report.middleware.ts` . In this web middleware, we print the time when the controller (Controller) executes.
```
➜  my_midway_app tree
.
├── src
│   ├── controller
│   │   ├── user.controller.ts
│   │   └── home.controller.ts
│   ├── interface.ts
│   ├── middleware                   ## middleare directory
│   │   └── report.middleware.ts
│   └── service
│       └── user.service.ts
├── test
├── package.json
└── tsconfig.json
```


Midway uses the `@Middleware` decorator to identify the middleware. The complete middleware sample code is as follows.


```typescript
import { IMiddleware } from '@midwayjs/core';
import { Middleware } from '@midwayjs/decorator';
import { NextFunction, Context } from '@midwayjs/koa';

@Middleware()
export class ReportMiddleware implements IMiddleware<Context, NextFunction> {

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // Logic executed before the controller
      const startTime = Date.now();
      // Execute the next Web middleware and finally execute to the controller.
      // Here you can get the return value of the next middleware or controller.
      const result = await next();
      // Logic executed after the controller
      console.log(Date.now() - startTime);
      // Returns the result to the previous middleware
      return result;
    };
  }

  static getName(): string {
    return 'report';
  }
}
```


In short, `await next()` represents the next logic to be executed, which generally represents the controller execution. Before and after execution, we can perform some printing and assignment operations, which is also the biggest advantage of the onion ring model.

Note that Midway finishes the traditional onion model so that it can obtain the return value of the next middleware. At the same time, you can also return the result of this middleware to the previous middleware by using the `return` method.

The static `getName` method here is used to specify the name of the middleware to facilitate troubleshooting.

​	

## Use middleware


After the Web middleware is written, it needs to be applied to the request process.


According to the location of the application, there are two types:


- 1. Global middleware, middleware that all routes will execute, such as cookie, session, etc.
- 2. Routing middleware, middleware that a single/partial route will execute, such as pre-check of a route, data processing, etc.



The relationship between them is generally:


![image.png](https://img.alicdn.com/imgextra/i1/O1CN01oQZ5Rk1jReqck6YMn_!!6000000004545-2-tps-2350-584.png)



### Routing middleware


After writing the middleware, we need to apply it to each controller route.  `@Controller` the second parameter of the decorator, which allows us to easily add middleware to a routing group.
```typescript
import { Controller } from '@midwayjs/decorator';
import { ReportMiddleware } from '../middleware/report.middlweare';

@Controller('/', { middleware: [ ReportMiddleware ] })
export class HomeController {

}
```


Midway also provides middleware parameters on route decorators such as `@Get` and `@Post` to facilitate middleware interception of a single route.
```typescript
import { Controller, Get } from '@midwayjs/decorator';
import { ReportMiddleware } from '../middleware/report.middlweare';

@Controller('/')
export class HomeController {

  @Get('/', { middleware: [ ReportMiddleware ]})
  async home() {
  }
}
```



### Global middleware


The so-called global middleware is the Web middleware that takes effect on all routes.


We need to add middleware to the middleware list of the current framework before the application starts. `useMiddleware` method, we can add middleware to the middleware list.

```typescript
// src/configuration.ts
import { App, Configuration } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import { ReportMiddleware } from './middleware/user.middleware';

@Configuration({
  imports: [koa]
  // ...
})
export class AutoConfiguration {

  @App()
  app: koa.Application;

  async onReady() {
    this.app.useMiddleware(ReportMiddleware);
  }
}

```
You can add multiple middleware at the same time.

```typescript
async onReady() {
  this.app.useMiddleware([ReportMiddleware1, ReportMiddleware2]);
}
```

## Ignore and match routes

When middleware is executed, we can add logic that routes ignore.

```typescript
import { IMiddleware } from '@midwayjs/core';
import { Middleware } from '@midwayjs/decorator';
import { NextFunction, Context } from '@midwayjs/koa';

@Middleware()
export class ReportMiddleware implements IMiddleware<Context, NextFunction> {

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // ...
    };
  }

  ignore(ctx: Context): boolean {
    // The following route will ignore this middleware
    return ctx.path === '/'
      || ctx.path === '/api/auth'
      || ctx.path === '/api/login';
  }

  static getName(): string {
    return 'report';
  }
}
```

Similarly, you can also add matching routes. Only matching routes will execute the middleware. The `ignore` and `match` only take effect.

```typescript
import { IMiddleware } from '@midwayjs/core';
import { Middleware } from '@midwayjs/decorator';
import { NextFunction, Context } from '@midwayjs/koa';

@Middleware()
export class ReportMiddleware implements IMiddleware<Context, NextFunction> {

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // ...
    };
  }

  match(ctx: Context): boolean {
    // The following matching route will execute this middleware
    if (ctx.path === '/api/index') {
      return true;
    }
  }

  static getName(): string {
    return 'report';
  }
}
```


## Function middleware

Midway still supports the form of function middleware and can be added to the middleware list using `useMiddleware`.

```typescript
// src/middleware/another.middleware.ts
export async function fnMiddleware(ctx, next) {
  // ...
  await next();
  // ...
}


// src/configuration.ts
import { App, Configuration } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import { ReportMiddleware } from './middleware/user.middleware';
import { fnMiddleware } from './middleware/another.middleware';

@Configuration({
  imports: [koa]
  // ...
})
export class AutoConfiguration {

  @App()
  app: koa.Application;

  async onReady() {
    // add middleware
    this.app.useMiddleware([ReportMiddleware, fnMiddleware]);
  }
}


```

In this way, many koa tripartite middleware in the community can be easily accessed.


Take `koa-static` as an example.


In the `koa-static` document, it is written as follows.

```typescript
const Koa = require('koa');
const app = new Koa();
app.use(require('koa-static')(root, opts));
```

Then, the `require('koa-static'))(root, opts)` is actually the returned middleware method. We can export it directly and call `useMiddleware`.

```typescript
async onReady() {
  // add middleware
  this.app.useMiddleware(require('koa-static')(root, opts));
}
```



## Get the middleware name

Each middleware should have a name. By default, the name of the class middleware will be obtained according to the following rules:

- 1. When the static method of `getName()` exists, take its return value as the name
- 2. If there is no static method of `getName()`, the class name will be used as the middleware name.

A well-recognized middleware name plays a big role in manually sorting or debugging code.

```typescript
@Middleware()
export class ReportMiddleware implements IMiddleware<Context, NextFunction> {

  // ...

  static getName(): string {
    return 'report'; // Middleware name
  }
}
```

Function middleware is similar. The defined method name is the name of middleware, such as the following `fnMiddleware`.

```typescript
export async function fnMiddleware(ctx, next) {
  // ...
  await next();
  // ...
}
```

If the third-party middleware exports an anonymous middleware function, you can use `_name` to add a name.

```typescript
const fn = async (ctx, next) => {
  // ...
  await next();
  // ...
};

fn._name = 'fnMiddleware';

```

We can use `getMiddleware().getNames()` to obtain all middleware names in the current middleware list.

```typescript
// src/configuration.ts
import { App, Configuration } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import { ReportMiddleware } from './middleware/user.middleware';
import { fnMiddleware } from './middleware/another.middleware';

@Configuration({
  imports: [koa]
  // ...
})
export class AutoConfiguration {

  @App()
  app: koa.Application;

  async onReady() {
    // add middleware
    this.app.useMiddleware([ReportMiddleware, fnMiddleware]);

    // output
    console.log(this.app.getMiddleware().getNames());
    // => report, fnMiddleware
  }
}



```



## Middleware sequence

Sometimes, we need to modify the order of middleware in components or applications.

Midway provides `insert` API operations to facilitate you to quickly adjust middleware.

We need to use the `getMiddleware()` method to obtain the middleware list and then operate on it.

```typescript
// src/configuration.ts
import { App, Configuration } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import { ReportMiddleware } from './middleware/user.middleware';

@Configuration({
  imports: [koa]
  // ...
})
export class AutoConfiguration {

  @App()
  app: koa.Application;

  async onReady() {
    // Add middleware to the front
    this.app.getMiddleware().insertFirst(ReportMiddleware);
    // Adding middleware to the back is equivalent to useMiddleware
    this.app.getMiddleware().insertLast(ReportMiddleware);

    // After adding middleware to middleware named session
    this.app.getMiddleware().insertAfter(ReportMiddleware, 'session');
    // Before adding middleware to middleware named session
    this.app.getMiddleware().insertBefore(ReportMiddleware, 'session');
  }
}

```




## Common examples



### Get request scope instance in middleware


Due to the particularity of the life cycle of Web middleware, it will be loaded (bound) to the route before the application request, so it cannot be associated with the request. The scope of the middleware class is **fixed as a singleton (Singleton)**.


Because **the middleware instance is a single instance**, the instances injected in the middleware are not bound to the request, **ctx cannot be obtained**, and `@Inject()` cannot be used to inject the instance of the request scope. Only the Singleton instances can be obtained.


For example, **the following code is wrong.**

```typescript
import { IMiddleware } from '@midwayjs/core';
import { Middleware } from '@midwayjs/decorator';
import { NextFunction, Context } from '@midwayjs/koa';

@Middleware()
export class ReportMiddleware implements IMiddleware<Context, NextFunction> {

  @Inject()
  userService; // The instance and context injected here are not bound and ctx cannot be obtained.

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // TODO
      await next();
    };
  }

}
```


If you want to get an instance of the request scope, you can use the method obtained from the request scope container `ctx.requestContext`, as follows.

```typescript
import { IMiddleware } from '@midwayjs/core';
import { Middleware } from '@midwayjs/decorator';
import { NextFunction, Context } from '@midwayjs/koa';

@Middleware()
export class ReportMiddleware implements IMiddleware<Context, NextFunction> {

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const userService = await ctx.requestContext.getAsync<UserService>(UserService);
      // TODO userService.xxxx
      await next();
    };
  }

}
```

### Unified return data structure

For example, all data returned in the `/api` uses a unified structure to reduce duplicate code in the Controller.

We can add a middleware code similar to the following.

```typescript
import { IMiddleware } from '@midwayjs/core';
import { Middleware } from '@midwayjs/decorator';
import { NextFunction, Context } from '@midwayjs/koa';

@Middleware()
export class FormatMiddleware implements IMiddleware<Context, NextFunction> {

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const result = await next();
      return {
        code: 0
        msg: 'OK',
        data: result
      }
    };
  }

  match(ctx) {
    return ctx.path.indexOf('/api')! = = -1;
  }
}
```

The preceding code is only the code that is returned with the correct logic. If you want to return an incorrect package, you can use [Filter](./error_filter).



### About the case where middleware returns null

under koa/egg, if a null value is returned in the middleware, the status code will become 204, and the status code needs to be explicitly assigned to the middleware.

```typescript
import { IMiddleware } from '@midwayjs/core';
import { Middleware } from '@midwayjs/decorator';
import { NextFunction, Context } from '@midwayjs/koa';

@Middleware()
export class FormatMiddleware implements IMiddleware<Context, NextFunction> {

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const result = await next();
      if (result === null) {
        ctx.status = 200;
      }
      return {
        code: 0
        msg: 'OK',
        data: result
      }
    };
  }

  match(ctx) {
    return ctx.path.indexOf('/api')! = = -1;
  }
}
```

