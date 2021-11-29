# Web 中间件

Web 中间件是在控制器调用 **之前** 和 **之后（部分） **调用的函数。 中间件函数可以访问请求和响应对象。
![image.png](https://cdn.nlark.com/yuque/0/2020/png/501408/1600592120947-c000a3a8-5da1-4a8d-839a-c6f81b771577.png#height=219&id=j94H0&margin=%5Bobject%20Object%5D&name=image.png&originHeight=438&originWidth=2196&originalType=binary&ratio=1&size=56855&status=done&style=none&width=1098)


不同的上层 Web 框架中间件形式不同，EggJS 的中间件形式和 Koa 的中间件形式相同，都是基于[洋葱圈模型](https://eggjs.org/zh-cn/intro/egg-and-koa.html#midlleware)。而 Express 则是传统的队列模型。


所以在 Express 中，中间件**只能在控制器之前**调用，而 Koa 和 EggJs 可以在**控制器前后都被执行**。


由于 Web 中间件使用较为类同，下面的代码，我们将以 @midwayjs/web（Egg.js）框架举例。


## 编写 Web 中间件


一般情况下，我们会在 `src/middleware` 文件夹中编写 Web 中间件。


创建一个 `src/middleware/report.ts` 。我们在这个 Web 中间件中打印了控制器（Controller）执行的时间。
```
➜  my_midway_app tree
.
├── src
│   ├── controller
│   │   ├── user.ts
│   │   └── home.ts
│   ├── interface.ts
│   ├── middleware                   ## 中间件目录
│   │   └── report.ts
│   └── service
│       └── user.ts
├── test
├── package.json
└── tsconfig.json
```


代码如下。


```typescript
import { Provide } from '@midwayjs/decorator';
import { IWebMiddleware, IMidwayWebNext } from '@midwayjs/web';
import { Context } from 'egg';

@Provide()
export class ReportMiddleware implements IWebMiddleware {

  resolve() {
    return async (ctx: Context, next: IMidwayWebNext) => {
      // 控制器前执行的逻辑
      const startTime = Date.now();
      // 执行下一个 Web 中间件，最后执行到控制器
      await next();
      // 控制器之后执行的逻辑
      console.log(Date.now() - startTime);
    };
  }

}
```


简单来说， `await next()` 则代表了下一个要执行的逻辑，这里一般代表控制器执行，在执行的前后，我们可以进行一些打印和赋值操作，这也是洋葱圈模型最大的优势。


注意，这里我们导出了一个 `ReportMiddleware` 类，这个中间件类的 key 为 `reportMiddleware` 。


## 使用 Web 中间件


Web 中间件在写完之后，需要应用到请求流程之中。


根据应用到的位置，分为两种：


- 1、全局中间件，所有的路由都会执行的中间件，比如 cookie、session 等等
- 2、路由中间件，单个/部分路由会执行的中间件，比如某个路由的前置校验，数据处理等等



他们之间的关系一般为：


![image.png](https://cdn.nlark.com/yuque/0/2021/png/501408/1612801319333-17e50d3a-7baf-4bcc-af57-2be544152580.png#height=292&id=hCpBr&margin=%5Bobject%20Object%5D&name=image.png&originHeight=584&originWidth=2350&originalType=binary&ratio=1&size=118405&status=done&style=none&width=1175)
### 路由中间件


在写完中间件之后，我们需要把它应用到各个控制器路由之上。 `@Controller` 装饰器的第二个参数，可以让我们方便的在某个路由分组之上添加中间件。
```typescript
import { Controller, Provide } from '@midwayjs/decorator';
import { Context } from 'egg';

@Provide()
@Controller('/', { middleware: [ 'reportMiddleware' ] })
export class HomeController {

}
```


Midway 同时也在 `@Get` 、 `@Post` 等路由装饰器上都提供了 middleware 参数，方便对单个路由做中间件拦截。
```typescript
import { Controller, Get, Provide } from '@midwayjs/decorator';

@Provide()
@Controller('/')
export class HomeController {

  @Get('/', { middleware: [ 'reportMiddleware' ]})
  async home() {
  }
}
```


这里 middleware 属性的参数则是依赖注入容器的 key，也就是 `@Provide` 的值，前面讲过，默认为类名的驼峰形式。


### 全局中间件


所谓的全局中间件，就是对所有的路由生效的 Web 中间件。传统的 Express/Koa 中间件都可以是全局中间件。


设置全局中间件需要拿到应用的实例，同时，需要在所有请求之前被加载。


在 EggJS 中，其提供了一个配置性的加载全局中间件的用法。在 `src/config/config.default.ts` 中配置 `middleware` 属性即可定义全局中间件，同样的，指定全局中间件的 key 即可。
```typescript
// src/config/config.default.ts

export default (appInfo: EggAppInfo) => {
  const config = {} as DefaultConfig;

  // ...

  config.middleware = [
    'reportMiddleware'
  ];

  return config;
};

```
:::info
此配置方法为 EggJS 的特殊用法。
:::


## 常见示例
### 接入三方中间件


社区有很多三方中间件，Midway 的 Class 写法可以比较方便的接入。本质上， `resolve()` 方法只需要返回一个符合当前中间件格式的方法即可。


我们以 `koa-static` 举例。


在 `koa-static` 文档中，是这样写的。
```typescript
const Koa = require('koa');
const app = new Koa();
app.use(require('koa-static')(root, opts));
```
那么， `require('koa-static')(root, opts)` 这个，其实就是返回的中间件方法，我们只需要将这段代码加入到 `resolve` 方法中，


类写法示例如下。
```typescript
import * as koaStatic from 'koa-static';
import { join } from 'path';

@Provide()
export class ReportMiddleware implements IWebMiddleware {

  resolve() {
    return koaStatic(join(__dirname, '../public'));
  }

}
```


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


### 传统函数式中间件


如果要继续使用 EggJS 传统的函数式写法，请参考 [EggJS 章节](https://www.yuque.com/midwayjs/midway_v2/eggjs)。


### 特殊的全局中间件用法


Midway 提供了一个生命周期的口子，方便业务在非常早的时候可以做一些自定义处理。我们需要手动创建一个生命周期文件，位于 `src/configuration.ts` 。


```
➜  my_midway_app tree
.
├── src
│   ├── configuration.ts           ## 全局生命周期配置文件
│   ├── controller
│   │   ├── user.ts
│   │   └── home.ts
│   ├── interface.ts
│   ├── middleware
│   │   └── report.ts
│   └── service
│       └── user.ts
├── test
├── package.json
└── tsconfig.json
```
内容如下：
```typescript
// src/configuration.ts
import { Configuration, App } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import { Application } from 'egg';

@Configuration()
export class ContainerLifeCycle implements ILifeCycle {

  @App()
  app: Application;

  async onReady() {
  	this.app.use(await this.app.generateMiddleware('reportMiddleware'));
  }
}
```
Midway 在各个 Web 框架的 app 上提供了一个 `generateMiddleware` 方法，用于快速创建 Class 形式的中间件，然后使用框架原有的 `use` 方法即可加载为全局中间件。


在 onReady 中加载的中间件，**框架会保证在 egg 中间件加载之前被执行**。


:::info
代码编写完后，请先执行一次 `npm run dev` ，egg 需要在第一次运行后才会生成定义。
:::




### 全局路由前缀


全局的路由前缀可以由反向代理工具来做，比如 nginx，也可以由中间件代码来完成，下面的中间件简单演示了如何为所有路由增加 `api` 前缀。
```typescript
import { Provide } from "@midwayjs/decorator";

@Provide()
export class PrefixMiddleware {
  resolve() {
    return async(ctx, next) => {
      ctx.path = (ctx.path.replace(/^\/api/, '') || '/');
      await next();
    };
  }
}
```
