# 守卫

从 v3.6.0 开始，Midway 提供守卫能力。

守卫会根据运行时出现的某些条件（例如权限，角色，访问控制列表等）来确定给定的请求是否由路由处理程序处理。 

普通的应用程序中，一般会在中间件中处理这些逻辑，但是中间件的逻辑过于通用，同时也无法很优雅的去和路由方法进行结合，为此我们在中间件之后，进入路由方法之前设计了守卫，可以方便的进行方法鉴权等处理。

守卫会在中间件 **之后**，路由方法 **之前** 执行。

下面的代码，我们将以 `@midwayjs/koa` 举例。



## 编写守卫


一般情况下，我们会在 `src/guard` 文件夹中编写守卫。


创建一个 `src/guard/auth.guard.ts` ，用于验证路由是否能被用户访问。

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


Midway 使用 `@Guard` 装饰器标识守卫，示例代码如下。


```typescript
import { IMiddleware, Guard, IGuard } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Guard()
export class AuthGuard implements IGuard<Context> {
  async canActivate(context: Context, supplierClz, methodName: string): Promise<boolean> {
    // ...
  }
}
```

`canActivate` 方法用于在请求中验证是否可以访问后续的方法，当返回 true 时，后续的方法会被执行，当 `canActivate` 返回 false 时，会抛出 403 错误码。 

:::tip

注意，当前只有类 Controller 才能使用守卫。

:::



## 使用守卫

守卫可以被应用到不同的框架上，在 http 下，可以应用到全局，Controller 和方法上。



### 路由守卫

在写完守卫之后，我们需要把它应用到各个控制器路由之上。 

使用 `UseGuard` 装饰器，我们可以应用到类和方法上。

```typescript
import { Controller } from '@midwayjs/decorator';
import { AuthGuard } from '../guard/auth.guard';

@UseGuard(AuthGuard)
@Controller('/')
export class HomeController {

}
```


Midway 同时也在 `@Get` 、 `@Post` 等路由装饰器上都提供了 middleware 参数，方便对单个路由做中间件拦截。

```typescript
import { Controller, Get } from '@midwayjs/decorator';
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

也可以传入数组。

```typescript
@UseGuard([AuthGuard, Auth2Guard])
```



### 全局守卫


我们需要在应用启动前，加入当前框架的守卫列表中，`useGuard` 方法，可以把守卫加入到守卫列表中。

```typescript
// src/configuration.ts
import { App, Configuration } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import { AuthGuard } from './guard/auth.guard';

@Configuration({
  imports: [koa]
  // ...
})
export class AutoConfiguration {

  @App()
  app: koa.Application;

  async onReady() {
    this.app.useGuard(AuthGuard);
  }
}

```

同理可以添加多个守卫。

```typescript
async onReady() {
  this.app.useGuard([AuthGuard, Auth2Guard]);
}
```



## 自定义错误

默认情况下，守卫的 `canActivate` 方法当返回 false 时，框架会抛出 403 错误（`ForbiddenError`）。

你也可以在守卫中自行决定需要抛出的错误。

```typescript
import { IMiddleware, Guard, IGuard, httpError } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Guard()
export class AuthGuard implements IGuard<Context> {
  async canActivate(context: Context, supplierClz, methodName: string): Promise<boolean> {
    // ...
    if (methodName ==='xxx') {
      throw new httpError.ForbiddenError();
    }
  }
}
```



## 基于角色的鉴权示例

一般情况下，我们会把方法访问和角色关联起来，下面我们来简单实现一个基于用户角色的访问控制。

首先，我们定义一个 `@Role` 装饰器，用于设定方法的访问权限。

```typescript
// src/decorator/role.decorator.ts
import { savePropertyMetadata } from '@midwayjs/core';

export const ROLE_META_KEY = 'role:name'

export function Role(roleName: string | string[]): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    roleName = [].concat(roleName);
    // 只保存元数据
    savePropertyMetadata(ROLE_META_KEY, roleName, target, propertyKey);
  };
}
```

编写一个守卫，用于角色鉴权。

```typescript
import { IMiddleware, Guard, IGuard, getPropertyMetadata } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ROLE_META_KEY } from '../decorator/role.decorator.ts';

@Guard()
export class AuthGuard implements IGuard<Context> {
  async canActivate(context: Context, supplierClz, methodName: string): Promise<boolean> {
    // 从类元数据上获取角色信息
    const roleNameList = getPropertyMetadata<string[]>(ROLE_META_KEY, supplierClz, methodName);
    if (roleNameList && roleNameList.length && context.user.role) {
      // 假设中间件已经拿到了用户角色信息，保存到了 context.user.role 中
      // 直接判断是否包含该角色
      return roleNameList.includes(context.user.role);
    }
    
    return false;
  }
}
```

在路由上使用该守卫。

```typescript
import { Controller, Get } from '@midwayjs/decorator';
import { ReportMiddleware } from '../middleware/report.middlweare';
import { AuthGuard } from '../guard/auth.guard';

@UseGuard(AuthGuard)
@Controller('/user')
export class HomeController {

  // 只允许 admin 访问
  @Role(['admin'])
  @Get('/getUserRoles')
  async getUserRoles() {
    // ...
  }
}
```

只有当 `ctx.user.role` 返回了 `admin` 的时候，才会被允许访问 `/getUserRoles` 路由。
