# Web 中间件

Web 中间件是在控制器调用 **之前** 和 **之后（部分） **调用的函数。 中间件函数可以访问请求和响应对象。
![image.png](https://img.alicdn.com/imgextra/i1/O1CN01h6hYvW1ogNexjJ3Nl_!!6000000005254-2-tps-2196-438.png)


不同的上层 Web 框架中间件形式不同，Midway 标准的中间件基于 [洋葱圈模型](https://eggjs.org/zh-cn/intro/egg-and-koa.html#midlleware)。而 Express 则是传统的队列模型。


Koa 和 EggJs 可以在**控制器前后都被执行**，在 Express 中，中间件 **只能在控制器之前** 调用，将在 Express 章节单独介绍。

下面的代码，我们将以 @midwayjs/koa 框架举例。




## 编写中间件


一般情况下，我们会在 `src/middleware` 文件夹中编写 Web 中间件。


创建一个 `src/middleware/report.middleware.ts` 。我们在这个 Web 中间件中打印了控制器（Controller）执行的时间。
```
➜  my_midway_app tree
.
├── src
│   ├── controller
│   │   ├── user.controller.ts
│   │   └── home.controller.ts
│   ├── interface.ts
│   ├── middleware                   ## 中间件目录
│   │   └── report.middleware.ts
│   └── service
│       └── user.service.ts
├── test
├── package.json
└── tsconfig.json
```


Midway 使用 `@Middleware` 装饰器标识中间件，完整的中间件示例代码如下。


```typescript
import { IMiddleware } from '@midwayjs/core';
import { Middleware } from '@midwayjs/decorator';
import { NextFunction, Context } from '@midwayjs/koa';

@Middleware()
export class ReportMiddleware implements IMiddleware<Context, NextFunction> {

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // 控制器前执行的逻辑
      const startTime = Date.now();
      // 执行下一个 Web 中间件，最后执行到控制器
      // 这里可以拿到下一个中间件或者控制器的返回值
      const result = await next();
      // 控制器之后执行的逻辑
      console.log(Date.now() - startTime);
      // 返回给上一个中间件的结果
      return result;
    };
  }

  static getName(): string {
    return 'report';
  }
}
```


简单来说， `await next()` 则代表了下一个要执行的逻辑，这里一般代表控制器执行，在执行的前后，我们可以进行一些打印和赋值操作，这也是洋葱圈模型最大的优势。

注意，Midway 对传统的洋葱模型做了一些微调，使得其可以获取到下一个中间件的返回值，同时，你也可以将这个中间件的结果，通过 `return` 方法返回给上一个中间件。

这里的静态 `getName` 方法，用来指定中间件的名字，方便排查问题。



## 使用中间件


Web 中间件在写完之后，需要应用到请求流程之中。


根据应用到的位置，分为两种：


- 1、全局中间件，所有的路由都会执行的中间件，比如 cookie、session 等等
- 2、路由中间件，单个/部分路由会执行的中间件，比如某个路由的前置校验，数据处理等等



他们之间的关系一般为：


![image.png](https://img.alicdn.com/imgextra/i1/O1CN01oQZ5Rk1jReqck6YMn_!!6000000004545-2-tps-2350-584.png)



### 路由中间件


在写完中间件之后，我们需要把它应用到各个控制器路由之上。 `@Controller` 装饰器的第二个参数，可以让我们方便的在某个路由分组之上添加中间件。
```typescript
import { Controller } from '@midwayjs/decorator';
import { ReportMiddleware } from '../middleware/report.middlweare';

@Controller('/', { middleware: [ ReportMiddleware ] })
export class HomeController {

}
```


Midway 同时也在 `@Get` 、 `@Post` 等路由装饰器上都提供了 middleware 参数，方便对单个路由做中间件拦截。
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



### 全局中间件


所谓的全局中间件，就是对所有的路由生效的 Web 中间件。


我们需要在应用启动前，加入当前框架的中间件列表中，`useMiddlware` 方法，可以把中间件加入到中间件列表中。

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
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
    this.app.useMiddlware(ReportMiddleware);
  }
}

```
你可以同时添加多个中间件。

```typescript
async onReady() {
	this.app.useMiddlware([ReportMiddleware1, ReportMiddleware2]);
}
```



## 函数中间件

Midway 依旧支持函数中间件的形式，并且可以使用 `useMiddlware` 来加入到中间件列表。

```typescript
// src/middleware/another.middleware.ts
export async function fnMiddleware(ctx, next) {
  // ...
  await next();
  // ...
}


// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
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
    this.app.useMiddlware([ReportMiddleware, fnMiddleware]);
  }
}


```

这样的话，社区很多 koa 三方中间件都可以比较方便的接入。


我们以 `koa-static` 举例。


在 `koa-static` 文档中，是这样写的。

```typescript
const Koa = require('koa');
const app = new Koa();
app.use(require('koa-static')(root, opts));
```

那么， `require('koa-static')(root, opts)` 这个，其实就是返回的中间件方法，我们直接导出，并且调用 `useMiddlware` 即可。

```typescript
async onReady() {
  // add middleware
  this.app.useMiddlware(require('koa-static')(root, opts));
}
```



## 获取中间件名

每个中间件应当有一个名字，默认情况下，类中间件的名字将依照下面的规则获取：

- 1、当 `getName()` 静态方法存在时，以其返回值作为名字
- 2、如果不存在 `getName()` 静态方法，将使用类名作为中间件名

一个好认的中间件名在手动排序或者调试代码时有很大的作用。

```typescript
@Middleware()
export class ReportMiddleware  implements IMiddleware<Context, NextFunction> {

  // ...

  static getName(): string {
    return 'report';	// 中间件名
  }
}
```

函数中间件也是类似，定义的方法名就是中间件的名字，比如下面的 `fnMiddleware` 。

```typescript
export async function fnMiddleware(ctx, next) {
  // ...
  await next();
  // ...
}
```

假如三方中间件导出了一个匿名的中间件函数，那么你可以使用 `_name` 来添加一个名字。

```typescript
const fn = async (ctx, next) => {
  // ...
  await next();
  // ...
};

fn._name = 'fnMiddleware';

```

我们可以使用 `getMiddlware().getNames()` 来获取当前中间件列表中的所有中间件名。

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
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
    this.app.useMiddlware([ReportMiddleware, fnMiddleware]);

    // output
    console.log(this.app.getMiddleware().getNames());
    // => report, fnMiddleware
  }
}



```



## 中间件顺序

有时候，我们需要在组件或者应用中修改中间件的顺序。

Midway 提供了 `insert` 系列的 API，方便用户快速调整中间件。

我们需要先使用 `getMiddlware()` 方法获取中间件列表，然后对其进行操作。

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/decorator';
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
    // 把中间件添加到最前面
    this.app.getMiddlware().insertFirst(ReportMiddleware);
    // 把中间件添加到最后面，等价于 useMiddlware
    this.app.getMiddlware().insertLast(ReportMiddleware);

    // 把中间件添加到名为 session 的中间件之后
    this.app.getMiddlware().insertAfter(ReportMiddleware, 'session');
    // 把中间件添加到名为 session 的中间件之前
    this.app.getMiddlware().insertBefore(ReportMiddleware, 'session');
  }
}

```




## 常见示例



### 中间件中获取请求作用域实例


由于 Web 中间件在生命周期的特殊性，会在应用请求前就被加载（绑定）到路由上，所以无法和请求关联。中间件类的作用域 **固定为单例（Singleton**）。


由于 **中间件实例为单例**，所以中间件中注入的实例和请求不绑定，**无法获取到 ctx**，无法使用 `@Inject()` 注入请求作用域的实例，只能获取 Singleton 的实例。


比如，**下面的代码是错误的。**
```typescript
import { Provide } from '@midwayjs/decorator';
import { IWebMiddleware, IMidwayWebNext } from '@midwayjs/web';
import { Context } from 'egg';

@Provide()
export class ReportMiddleware implements IWebMiddleware {

  @Inject()
  userService;			// 这里注入的实例和上下文不绑定，无法获取到 ctx

  resolve() {
    return async (ctx: Context, next: IMidwayWebNext) => {
			// TODO
      await next();
    };
  }

}
```


如果要获取请求作用域的实例，可以使用从请求作用域容器 `ctx.requestContext` 中获取，如下面的方法。
```typescript
import { Provide } from '@midwayjs/decorator';
import { IWebMiddleware, IMidwayWebNext } from '@midwayjs/web';
import { Context } from 'egg';

@Provide()
export class ReportMiddleware implements IWebMiddleware {

  resolve() {
    return async (ctx: Context, next: IMidwayWebNext) => {
      const userService = await ctx.requestContext.getAsync<UserService>('userService');
   		// TODO userService.xxxx
      await next();
    };
  }

}
```



