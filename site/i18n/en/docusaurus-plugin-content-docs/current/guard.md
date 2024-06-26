# Guards

Starting from v3.6.0, Midway provides guard capability.

The guard determines whether a given request is handled by the routing handler based on certain conditions that appear at runtime (such as permissions, roles, access control lists, etc.).

In ordinary applications, these logics are usually processed in the middleware, but the logic of the middleware is too common, and it cannot be combined with routing methods gracefully. For this reason, we have designed guards after the middleware and before entering the routing method, which can facilitate method authentication and other processing.

For the following code, we will take `@midwayjs/koa` as an example.



## Write guards


In general, you can write a guard in the `src/guard` folder.


Create a `src/guard/auth.guard.ts` to verify whether the route can be accessed by the user.

```
➜  my_midway_app tree
.
├── src
│   ├── controller
│   │   ├── user.controller.ts
│   │   └── home.controller.ts
│   ├── interface.ts
│   ├── guard
│   │   └── auth.guard.ts
│   └── service
│       └── user.service.ts
├── test
├── package.json
└── tsconfig.json
```


Midway uses the `@Guard` decorator to identify the guard. The sample code is as follows.


```typescript
import { IMiddleware, Guard, IGuard } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Guard()
export class AuthGuard implements IGuard<Context> {
  async canActivate(context: Context, suppilerClz, methodName: string): Promise<boolean> {
    // ...
  }
}
```

`canActivate` method is used to verify whether subsequent methods can be accessed in the request. When true is returned, subsequent methods will be executed. When false is `canActivate`, 403 error codes will be thrown.



## Use guards

Guards can be applied to different frameworks. In http, they can be applied globally, to Controllers, and to methods. In other Framework implementations, they can only be used on methods.



### Routing guard

After writing the guard, we need to apply it to each controller route.

Using `UseGuard` decorators, we can apply them to classes and methods.

```typescript
import { Controller } from '@midwayjs/core';
import { AuthGuard } from '../guard/auth.guard';

@UseGuard(AuthGuard)
@Controller('/')
export class HomeController {

}
```


Apply guards on methods.

```typescript
import { Controller, Get } from '@midwayjs/core';
import { ReportMiddleware } from '../middleware/report.middlweare';
import { AuthGuard } from '../guard/auth.guard';

@Controller('/')
export class HomeController {

  @UseGuard(AuthGuard)
  @Get('/', { middleware: [ ReportMiddleware ]})
  async home() {
  }
}
```

You can also pass in arrays.

```typescript
@UseGuard([AuthGuard, Auth2Guard])
```



### Global guard


We need to join the guard list of the current framework before the application starts. `useGuard` method, we can add the guard to the guard list.

```typescript
// src/configuration.ts
import { App, Configuration } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import { AuthGuard } from './guard/auth.guard';

@Configuration({
  imports: [koa]
  // ...
})
export class MainConfiguration {

  @App()
  app: koa.Application;

  async onReady() {
    this.app.useGuard(AuthGuard);
  }
}
```

In the same way, multiple guards can be added.

```typescript
async onReady() {
  this.app.useGuard([AuthGuard, Auth2Guard]);
}
```



## Custom error

By default, when the guard's `canActivate` method returns false, the framework throws a 403 error (`ForbiddenError` ).

You can also decide on your own in the guard the errors that need to be thrown.

```typescript
import { IMiddleware, Guard, IGuard, httpError } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Guard()
export class AuthGuard implements IGuard<Context> {
  async canActivate(context: Context, suppilerClz, methodName: string): Promise<boolean> {
    // ...
    if (methodName ==='xxx') {
      throw new httpError.ForbiddenError();
    }
    
    return true;
  }
}
```

:::tip

Note that the global error handler will also intercept errors thrown by guards.

:::



## Difference from middleware

Guards will be executed **after** the global middleware and **before** the business logic of the routing method.

Middleware generally writes general processing logic, such as login, user identification, security verification, etc., while guards are more suitable for routing-based permission control because they are inside the routing.

Although there is routing information in the middleware, it is impossible to clearly know which actual routing controller is entered (unless additional query matching), while guards have entered the routing method, which has a relatively large advantage in performance.



## Example of Role-Based Authentication

In general, we associate method access with roles, and let's simply implement a user role-based access control.

First, we define a `@Role` decorator to set the access permissions of the method.

```typescript
// src/decorator/role.decorator.ts
import { savePropertyMetadata } from '@midwayjs/core';

export const ROLE_META_KEY = 'role:name'

export function Role(roleName: string | string[]): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    roleName = [].concat(roleName);
    // Save only metadata
    savePropertyMetadata(ROLE_META_KEY, roleName, target, propertyKey);
  };
}
```

Write a guard for role authentication.

```typescript
import { IMiddleware, Guard, IGuard, getPropertyMetadata } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ROLE_META_KEY } from '../decorator/role.decorator.ts';

@Guard()
export class AuthGuard implements IGuard<Context> {
  async canActivate(context: Context, supplierClz, methodName: string): Promise<boolean> {
    // Get role information from class metadata
    const roleNameList = getPropertyMetadata<string[]>(ROLE_META_KEY, supplierClz, methodName);
    if (roleNameList && roleNameList.length && context.user.role) {
      // Assume that the middleware has already obtained the user role information and saved it to context.user.role
			// Directly determine whether to change the role
      return roleNameList.includes(context.user.role);
    }

    return false;
  }
}
```

Use this guard on the route.

```typescript
import { Controller, Get } from '@midwayjs/core';
import { ReportMiddleware } from '../middleware/report.middlweare';
import { AuthGuard } from '../guard/auth.guard';

@UseGuard(AuthGuard)
@Controller('/user')
export class HomeController {

  // Only admin access is allowed
  @Role(['admin'])
  @Get('/getUserRoles')
  async getUserRoles() {
    // ...
  }
}
```

Only when `ctx.user.role` returns `admin` is allowed to access the `/getUserRoles` route.
