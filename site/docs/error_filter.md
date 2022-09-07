# 异常处理

Midway 提供了一个内置的异常处理器，负责处理应用程序中所有未处理的异常。当您的应用程序代码抛出一个异常处理时，该处理器就会捕获该异常，然后等待用户处理。

异常处理器的执行位置处于中间件之后，所以它能拦截所有的中间件和业务抛出的错误。

![err_filter](https://img.alicdn.com/imgextra/i2/O1CN013pvSjT1nWvsLRE4vo_!!6000000005098-2-tps-2000-524.png)



## Http 异常

在 Http 请求中，Midway 提供了通用的 `MidwayHttpError` 类型的异常，其继承于标准的 `MidwayError`。

```typescript
export class MidwayHttpError extends MidwayError {
  // ...
}
```

我们可以在请求的过程中抛出该错误，由于错误中包含状态码，Http 程序将会自动返回该状态码。

比如，下面的代码，抛出了包含 400 状态码的错误。

```typescript
import { MidwayHttpError } from '@midwayjs/core';

// ...

async findAll() {
  throw new MidwayHttpError('my custom error', HttpStatus.BAD_REQUEST);
}

// got status: 400
```

但是一般我们很少这么做，大多数的业务的错误都是复用的，错误消息也基本是固定的，为了减少重复定义，我们可以自定义一些异常类型。

比如自定义一个状态码为 400 的 Http 异常，可以如下定义错误。

```typescript
// src/error/custom.error.ts
import { HttpStatus } from '@midwayjs/core';

export class CustomHttpError extends MidwayHttpError {
  constructor() {
    super('my custom error', HttpStatus.BAD_REQUEST);
  }
}
```

然后在业务中抛出使用。

```typescript
import { CustomHttpError } from './error/custom.error';

// ...

async findAll() {
  throw new CustomHttpError();
}
```



## 异常处理器

内置的异常处理器用于标准的请求响应场景，它可以捕获所有请求中抛出的错误。

通过 `@Catch` 装饰器我们可以定义某一类异常的处理程序，我们可以轻松的捕获某一类型的错误，做出处理，也可以捕获全局的错误，返回统一的格式。

同时，框架也提供了一些默认的 Http 错误，放在 `httpError` 这个对象下。

比如捕获抛出的 `InternalServerErrorError` 错误。

我们可以将这一类异常处理器放在 `filter` 目录，比如 `src/filter/internal.filter.ts`。

```typescript
// src/filter/internal.filter.ts
import { Catch } from '@midwayjs/decorator';
import { httpError, MidwayHttpError } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch(httpError.InternalServerErrorError)
export class InternalServerErrorFilter {
  async catch(err: MidwayHttpError, ctx: Context) {

    // ...
    return 'got 500 error, ' + err.message;
  }
}
```

`catch` 方法的参数为当前的错误，以及当前应用该异常处理器的上下文 `Context` 。我们可以简单的将响应的数据返回。

如果不写参数，那么会捕获所有的错误，不管是不是 HttpError，只在要请求中抛出的错误，都会被这里捕获。

```typescript
// src/filter/all.filter.ts
import { Catch } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

@Catch()
export class AllErrorFilter {
  async catch(err: Error, ctx: Context) {
    // ...
  }
}
```

定义的异常处理器只是一段普通的代码，我们还需要将它应用到我们某个框架的 app 中，比如 http 协议的 app。

我们可以在 `src/configuration.ts` 中将错误处理过滤器应用上，由于参数可以是数组，我们可以应用多个错误处理器。

```typescript
// src/configuration.ts
import { Configuration, App, Catch } from '@midwayjs/decorator';
import { join } from 'path';
import * as koa from '@midwayjs/koa';
import { InternalServerErrorFilter } from './filter/internal.filter';

@Configuration({
  imports: [
    koa
  ],
})
export class MainConfiguration {

  @App()
  app: koa.Application;

  async onReady() {
    this.app.useFilter([InternalServerErrorFilter]);
  }
}

```

:::info

注意，某些非 Midway 的中间件或者框架内部设置的状态码，由于未使用错误抛出的形式，所以拦截不到，如果在业务中返回 400 以上的状态，请尽可能使用标准的抛出错误的形式，方便拦截器做处理。

:::



### 404 处理

框架内部，如果未匹配到路由，会抛出一个 `NotFoundError` 的异常。通过异常处理器，我们可以自定义其行为。

比如跳转到某个页面，或者返回特定的结果：

```typescript
// src/filter/notfound.filter.ts
import { Catch } from '@midwayjs/decorator';
import { httpError, MidwayHttpError } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch(httpError.NotFoundError)
export class NotFoundFilter {
  async catch(err: MidwayHttpError, ctx: Context) {
    // 404 错误会到这里
    ctx.redirect('/404.html');

    // 或者直接返回一个内容
    return {
      message: '404, ' + ctx.path
    }
  }
}
```



### 500 处理

当不传递装饰器参数时，将捕获所有的错误。

比如，捕获所有的错误，并返回特定的 JSON 结构，示例如下。

```typescript
// src/filter/default.filter.ts

import { Catch } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

@Catch()
export class DefaultErrorFilter {
  async catch(err: Error, ctx: Context) {

    // ...
    return {
      status: err.status ?? 500,
      message: err.message;
    }
  }

}
```

我们可以在 `src/configuration.ts` 中将错误处理过滤器应用上，由于参数可以是数组，我们可以应用多个错误处理器。

```typescript
import { Configuration, App, Catch } from '@midwayjs/decorator';
import { join } from 'path';
import * as koa from '@midwayjs/koa';
import { DefaultErrorFilter } from './filter/default.filter';
import { NotFoundFilter } from './filter/notfound.filter';

@Configuration({
  imports: [
    koa
  ],
})
export class MainConfiguration {

  @App()
  app: koa.Application;

  async onReady() {
    this.app.useFilter([NotFoundFilter, DefaultErrorFilter]);
  }
}

```

使用异常处理器不需要考虑顺序，通用的错误处理器一定是最后被匹配，且一个 app 上有且只能有一个通用的错误处理器。



## 派生异常处理

默认情况下，异常只会进行绝对匹配。

有时候我们需要去捕获所有的派生类，这个时候需要额外设置。

```typescript
import { Catch } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { MidwayError } from '@midwayjs/core';

class CustomError extends MidwayError {}

class CustomError2 extends MidwayError {}

// 这里会捕获所有的子类
@Catch([MidwayError], {
  matchPrototype: true
})
class TestFilter {
  catch(err, ctx) {
    // ...
  }
}
```

通过配置 `matchPrototype` 可以匹配所有的派生的类。



## 异常日志

Midway 内置了默认的异常处理行为。

如果 **没有匹配** 到异常处理器，都会被兜底的异常中间件拦截，记录。

反过来说，如果自定义了异常处理器，那么错误就会被当成正常的业务逻辑，请注意，这个时候底层抛出的异常就会作为业务正常的处理逻辑，而 **不会** 被日志记录。

你可以自行在异常处理器中打印日志。

```typescript
import { Catch } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

@Catch()
export class DefaultErrorFilter {
  async catch(err: Error, ctx: Context) {

    // ...
    ctx.logger.error(err);
    // ...
    return 'got 500 error, ' + err.message;
  }
}
```



## 内置的 Http 异常

下面这些框架内置的 Http 异常，都可以从 `@midwayjs/core` 中找到并使用，每个异常都已经包含默认的错误消息和状态码。

- `BadRequestError`
- `UnauthorizedError`
- `NotFoundError`
- `ForbiddenError`
- `NotAcceptableError`
- `RequestTimeoutError`
- `ConflictError`
- `GoneError`
- `PayloadTooLargeError`
- `UnsupportedMediaTypeError`
- `UnprocessableEntityError`
- `InternalServerErrorError`
- `NotImplementedError`
- `BadGatewayError`
- `ServiceUnavailableError`
- `GatewayTimeoutError`

比如：

```typescript
import { httpError } from '@midwayjs/core';

// ...

async findAll() {
  // something wrong
  throw new httpError.InternalServerErrorError();
}

// got status: 500

```

