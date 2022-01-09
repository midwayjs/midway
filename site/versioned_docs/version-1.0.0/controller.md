---
title: 路由和控制器
---

midway 使用 koa-router 作为路由的承载者，同时在 ts 的语法上做了一些简化，我们将路由和控制器放在了一起，使用装饰器来标注路由。

由于 midway 采用了 IoC 自扫描机制，使得在一定程度上弱化了目录结构约定，通过装饰器的机制，可以非常方便的进行解耦，按业务逻辑拆分等。

现在可以在任意目录下创建 controller，不再限定 app/controller 目录，同理，其他装饰器也不限定。

现在可以做到比如 `src/web/controller` 下放 controller，也可以按业务维度分，比如 `user` 目录，包含跟用户相关所有的 controller/service/dao 等，对微服务或者 serverless 比较友好。

### 路由装饰器

在新的 ts 体系中，我们的控制器目录为 `app/controller` ，我们在其中编写 `*.ts` 文件。例如下面的 `userController.ts` ，我们提供了一个获取用户的接口。

```typescript
import { provide, controller, inject, get } from 'midway';

@provide()
@controller('/user')
export class UserController {
  @inject('userService')
  service: IUserService;

  @inject()
  ctx;

  @get('/:id')
  async getUser(): Promise<void> {
    const id: number = this.ctx.params.id;
    const user: IUserResult = await this.service.getUser({ id });
    this.ctx.body = { success: true, message: 'OK', data: user };
  }
}
```

我们创建了 `@controller` 装饰器用来定义这个类为 Controller，同时，提供了方法装饰器用于标注请求的类型。

:::tip 小贴士
便于大家理解，`@controller` 的参数为字符串 pattern，我们会将这个值传入 `router.prefix(prefix)` 的参数中。
:::

midway 针对 web 请求，提供了和 koa-router 对应的方法装饰器，列表如下。

- [@get ](/get)
- [@post ](/post)
- [@del ](/del)
- [@put ](/put)
- [@patch ](/patch)
- [@options ](/options)
- [@head ](/head)
- [@all ](/all)

这几个装饰器用于修饰不同的异步方法，同时对应到了 koa-router 的相应的方法。和原有提供的控制器一样，每个控制器都为异步方法，默认参数为 koa 上下文。

```typescript
@get('/:id')
async getUser(ctx): Promise<void> {
    // TODO ctx...
}
```

### 路由绑定

在以往框架的写法中，提供的 `app/router` 文件，虽然可以直接使用，但是由于控制器被 IoC 管控的关系，会有一些区别。

和以往的写法不同的是，**我们需要从容器中拿到对应的控制器实例，并绑定到路由的 pattern 上**。

假如我们有一个控制器，同时没有提供 `@controller` 装饰器，表明他不是一个控制器，在应用初始化时不会自动绑定到某个路由上，但是由于有 `@provide` 装饰器，他会被 IoC 容器所加载。

```typescript
// app/controller/api.ts

@provide()
export class BaseApi {
  async index(ctx) {
    ctx.body = 'index';
  }
}
```

假如我们希望这个控制器可以被外部的路由使用。

```typescript
// app/router.ts

module.exports = function (app) {
  app.get('/api/index', app.generateController('baseApi.index'));
};
```

midway 扩展了一个 `app.generateController` 的方法来简化绑定的这个步骤，参数为 `ClassName.methodName` 的字符串形式。

### 路由优先级

在单页应用下，经常会出现 `/*` 这种路由，在原本的路由文件中，我们可以通过调整代码的顺序，来使的路由的匹配顺序发生变化。而由于使用了装饰器的关系，在新的体系无法控制文件扫描和加载顺序，这就使得路由匹配的顺序不可控。

midway 提供了 `@priority(priority: number)` 装饰器，用于修饰 class，定义路由的优先级，默认的路由优先级为 `0`，可以设置负数让优先级降低。

```typescript
@provide()
@priority(-1)
@controller('/')
export class HomeController {
  @get('/hello')
  async index(ctx) {
    ctx.body = 'hello';
  }

  @get('/*')
  async all(ctx) {
    ctx.body = 'world';
  }
}
```

### 路由中间件

有时候我们会有在特定路由上加载中间件的需求，在之前的版本只能通过定义 `router.ts` 文件来解决部分需求，而在新版本中，我们扩展了装饰器的能力，使之可以在特定场景下增加 web 中间件。

现在可以提供一个 middleware（任意目录），比如 `src/app/middleware/api.ts`。

```typescript
import { Middleware, WebMiddleware, provide, config } from 'midway';

@provide()
export class ApiMiddleware implements WebMiddleware {
  @config('hello')
  helloConfig;

  resolve(): Middleware {
    return async (ctx, next) => {
      ctx.api = '222' + this.helloConfig.b;
      await next();
    };
  }
}
```

由于是 class，依旧可以使用 inject/plugin/config 等装饰器修饰。

:::tip
推荐使用 `WebMiddleware` 接口来规范你的 web 中间件。
:::

```typescript
@provide()
@controller('/', { middleware: ['homeMiddleware'] })
export class My {
  @inject()
  ctx;

  @get('/', { middleware: ['apiMiddleware'] })
  async index() {
    this.ctx.body = this.ctx.home + this.ctx.api;
  }
}
```

在 `@controller` 和 `@get/post` 等路由装饰器上都提供了 middleware 参数。

这里的 middleware 参数是一个数组，可以传多个字符串或者 `koa middleware`，如果是字符串，会从 IoC 容器中获取对应的 `WebMiddleware` 接口实例的 `resolve` 方法的结果。

也可以直接传递 `koa middleware`。

```typescript
const mw: Middleware = async (ctx, next) => {
  ctx.home = '4444';
  await next();
};

const newMiddleware = (data): Middleware => {
  return async (ctx, next) => {
    ctx.api = data;
    await next();
  };
};

@provide()
@controller('/', { middleware: ['homeMiddleware', mw] })
export class My {
  @inject()
  ctx;

  @get('/api', { middleware: ['apiMiddleware', newMiddleware('5555')] })
  async index() {
    this.ctx.body = this.ctx.home + this.ctx.api;
  }
}
```

::: tip
这种方式只用于某个路由下的中间件，如果你希望使用全局中间件，那么请依旧使用 egg 的那种形式。
:::

#### 中间件注入的特殊性

由于中间件在生命周期的特殊性，会在应用请求前就被加载（绑定）到路由上，所以无法和上下文关联。

中间件类固定为单例（Singleton），所有注入的内容都为单例，包括但不限于 @config/@logger/[@plugin ](/plugin) 等。

这意味着你可以注入一个 service，但是这个 service 中无法注入 ctx 属性。

这个时候，你必须在 `resolve` 方法中，通过调用 `ctx.requestContext.getAsync('xxx')` 的方式来创建请求作用域实例，和上下文绑定。

```typescript
@provide()
export class ApiMiddleware implements WebMiddleware {
  @inject()
  myService; // 由于中间件实例属于单例，这个实例即使注入也无法获取到 ctx

  resolve(): Middleware {
    return async (ctx, next) => {
      // 必须通过从请求作用域中获取对象的方式，来绑定上下文
      ctx.service = await ctx.requestContext.getAsync('myService');
      await next();
    };
  }
}
```

### 一个方法挂载多个路由

新版本实现了在同一方法上可以挂载多个路由的能力。

```typescript
@provide()
@controller('/', { middleware: ['homeMiddleware'] })
export class My {
  @inject()
  ctx;

  @get('/', { middleware: ['apiMiddleware'] })
  @post('/api/data')
  async index() {
    this.ctx.body = this.ctx.home + (this.ctx.api || '');
  }
}
```

这样请求进来， post 和 get 拿到的结果是不一样的（get 请求挂载了额外的中间件）。
