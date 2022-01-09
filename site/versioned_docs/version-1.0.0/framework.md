---
title: 框架增强
---

## 框架增强注入

midway 默认使用 [injection](http://web.npm.alibaba-inc.com/package/injection) 这个包来做依赖注入，虽然 `@inject` 装饰器能满足大多数业务的需求，但是对于框架来说，还有需要扩展和使用的地方，比如插件，配置等等。

### 框架默认注入

在默认情况下，框架会注入一些属性，方便开发，这些属性都能通过 `@inject` 装饰器来注入。

```typescript
@inject()
appDir; // 当前项目的根目录

@inject()
baseDir;  // 当前项目基础目录 src 或者 dist，绝对路径

@inject()
ctx; // 请求作用域，koa ctx

@inject()
logger; // 请求作用域，ContextLogger
```

### 注入插件

midway 除了支持 eggjs 原本的 app.xx 的插件用法，为了和框架解耦，同时，也可以通过 `@plugin` 装饰器来注入插件。

我们以 `egg-jwt` 插件为例，这个插件提供了 `app.jwt` 对象，而 `@plugin` 装饰器，则是类似于直接从 app 对象上拿属性。

比如 `@plugin('jwt')`，其实就是 `app['jwt']`，这样的写法，就可以和 app 对象进行解耦。

```typescript
import { provide, plugin } from 'midway';

@provide()
export class BaseService {
  @plugin()
  jwt;
}
```

### 注入配置

在 midway 中不同环境的 config 都会挂载到 app.config 中，但是不是所有的业务逻辑都会依赖 app 对象，所以我们构造了 `@config` 装饰器来获取配置对象。

假如 `config.default.ts` 中有一些代码。

```typescript
export const hello = 1;
```

```typescript
import { provide, config } from 'midway';

@provide()
export class BaseService {
  @config('hello')
  config; // 1
}
```

通过这样，我们可以把 config 中的值直接注入到业务逻辑中。

### 注册定时任务

midway 的定时任务是基于 [egg 定时任务](https://eggjs.org/zh-cn/basics/schedule.html)提供了更多 typescript 以及装饰器方面的支持。定时任务可以存放在任意目录，例如 src/schedule 目录下，可以配置定时任务的属性和要执行的方法。例如：

```typescript
// src/schedule/hello.ts
import { provide, schedule, CommonSchedule } from 'midway';

@provide()
@schedule({
  interval: 2333, // 2.333s 间隔
  type: 'worker', // 指定某一个 worker 执行
})
export class HelloCron implements CommonSchedule {
  // 定时执行的具体任务
  async exec(ctx) {
    ctx.logger.info(process.pid, 'hello');
  }
}
```

:::info
推荐使用 `CommonSchedule` 接口来规范你的计划任务类。
:::

### 注入日志对象

在原有逻辑中，日志对象也都挂载在 app.loggers 中，通过在 config 中配置的 key 来生成不同的日志实例对象，比如插件的日志，链路的日志等。

比如自定义一个日志 `myLogger`，这个时候，日志的 key 则为 `myLogger` 。

```typescript
module.exports = (appInfo) => {
  return {
    customLogger: {
      myLogger: {
        file: path.join(appInfo.root, 'logs/xx.log'),
      },
    },
  };
};
```

这个时候可以用 `@logger` 来获取日志实例。

```typescript
import { provide, logger } from 'midway';

@provide()
export class BaseService {
  @logger('myLogger')
  logger;
}
```

### 请求作用域中的日志

midway 在新版本中默认对所有对象开启了请求作用域，处于该作用域下的对象，都会包含一个默认的日志对象。

:::info
该 logger 对象是在请求链路开始就埋入到 IoC 容器中，所以可以通过 [@inject ](https://www.yuque.com/inject) 可以获取该对象， key 就为 logger，如果和属性同名则可以不填。
:::

```typescript
@provide()
export class BaseService {
  @inject()
  logger;

  // 也可以直接传入 key // @inject('logger')
  // logger;
}
```

## 框架扩展方法

抛开 eggjs 对 koa 的 application/context/request/response 的扩展点，midway 在 IoC 方面也做了一些扩展。

### Application 扩展

具体接口见 [API 文档](https://midwayjs.org/midway/api-reference/classes/midwayapplication.html)

**baseDir**

由于 typescript 的关系，midway 的 app.baseDir 在开发时期指向了 `/src` 目录，而在构建之后部署阶段指向了 `/dist` 目录。

**appDir**

针对 baseDir 修改的情况，我们引入了一个新的 `app.appDir` 属性，用于指向应用根目录。

**applicationContext**

`app.applicationContext` 用于全局作用域的 IoC 容器，所有的单例对象都存放于该属性，可以从中获取到单例对象。

```typescript
await app.applicationContext.getAsync('xxx');
```

**pluginContext**

插件容器，用于存在现有的所有挂载在 app 上的插件实例。

```typescript
await app.pluginContext.getAsync('插件名');
```

### Context 扩展

**requestContext**

针对请求作用域的情况，我们在 context 对象上扩展了一个 `requestContext` 属性。

和 `applicationContext` 相同，也是 IoC 容器，用于存放一次请求链路上的对象，当请求结束后，该容器会被清空。

```typescript
await ctx.requestContext.getAsync('xxx');
```
