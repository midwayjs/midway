# 异常处理

Midway 提供了一个内置的异常处理器，负责处理应用程序中所有未处理的异常。当您的应用程序代码抛出一个异常处理时，该处理器就会捕获该异常，然后等待用户处理。

异常处理器的位置处于中间件之前，所以它能拦截所有的中间件和业务抛出的错误。

```
                              ┌ ─ ─ ─ ─ ─ ─ ─     ┌──────────────┐                            
                                             │    │              │                            
                              │                   │              │     ┌─────────────────────┐
                                             │    │              │     │                     │
      ───── Http Request  ────┤              ─────┤              ├────▶│    Controller A     │
                                             │    │              │     │                     │
                              │ Error Filter      │  Middleware  │     └─────────────────────┘
                                             │    │              │                │           
      ◀───  Http Response  ───┤              ─────┤              ├────────────────┘           
                                             │    │              │                            
                              │                   │              │                            
                                             │    │              │                            
                              └ ─ ─ ─ ─ ─ ─ ─     └──────────────┘                            
```



## 标准异常

每个异常都是内置的 Error 类型的实例。通过扩展标准 Error，Midway 提供了内置的错误类型，额外增加了一些属性。

```typescript
export class MidwayError extends Error {
	// ...
}
```

现阶段，所有 Midway 框架提供的错误，都是该错误类抛出的实例。

MidwayError 包括几个属性：

- name 错误的名字，比如 Error，TypeError 等，在自定义错误中，为自定义错误的类名
- message 错误的消息
- stack 错误的堆栈
- code 自定义错误码
- cause 错误的来源



我们可以通过简单的实例化并且抛出来使用，比如:

```typescript
import { MidwayError } from '@midwayjs/core';

// ...

async findAll() {
  throw new MidwayError('my custom error');
}
```

也可以在业务中自定义一些错误。

常见的，我们会把异常统一定义到 error 目录中。

```
➜  my_midway_app tree
.
├── src
│   └── error
│				├── customA.error.ts
│       └── customB.error.ts
├── test
├── package.json
└── tsconfig.json
```

如果业务有一些复用的异常，比如固定的错误

```typescript
// src/error/custom.error.ts
import { HttpStatus } from '@midwayjs/core';

export class CustomError extends MidwayError {
	constructor() {
    super('my custom error', 'CUSTOM_ERROR_CODE_10000');
  }
}
```

然后在业务中抛出使用。

```typescript
import { CustomError } from './error/custom.error';

// ...

async findAll() {
  throw new CustomError();
}

```

上面的 `CUSTOM_ERROR_CODE_10000` 为错误的错误码，一般我们会为不同的错误分配不同的错误码和错误消息，以方便排查问题。



## 框架内置的错误

以下是框架内置的错误，随着时间推移，我们会不断增加。

| 错误码       | 错误描述                     |
| ------------ | ---------------------------- |
| MIDWAY_10000 | 未知错误                     |
| MIDWAY_10001 | 未分类的错误                 |
| MIDWAY_10002 | 参数类型错误                 |
| MIDWAY_10003 | 依赖注入定义未找到           |
| MIDWAY_10004 | 功能不再支持                 |
| MIDWAY_10005 | 功能未实现                   |
| MIDWAY_10006 | 配置项丢失                   |
| MIDWAY_10007 | 依赖注入属性 resovler 未找到 |
| MIDWAY_10008 | 路由重复                     |
| MIDWAY_10009 | 使用了错误的方法             |
|              |                              |



## 注册错误码

框架提供了一种通用的注册错误码的机制，错误码后期可以方便的排错，统计。

在业务的错误定义，以及组件错误定义的时候非常有用。

错误码一般是个枚举值，比如：

```typescript
const CustomErrorEnum = {
  UNKNOWN: 10000,
  COMMON: 10001,
  PARAM_TYPE: 10002,
  // ...
};
```

在编码中，我们会提供固定的错误码，并且希望在 SDK 或者组件中不冲突，这就需要框架来支持。

Midway 提供了 `registerErrorCode` 方法，用于向框架注册不重复的错误码，并且进行一定的格式化。

比如，在框架内部，我们有如下的定义：

```typescript
import { registerErrorCode } from '@midwayjs/core';

export const FrameworkErrorEnum = registerErrorCode('midway', {
  UNKNOWN: 10000,
  COMMON: 10001,
  PARAM_TYPE: 10002,
	// ...
} as const);
```

`registerErrorCode` 包含两个参数：

- 错误分组，比如上面的 `midway` ，就是框架内置错误组名，在一个应用中，这个组名不应该重复
- 错误枚举对象，以错误名为 key，错误码为 value



方法会返回一个错误枚举值，枚举值会以错误名作为 key，错误分组加错误码作为 value。

比如：

```typescript
FrameworkErrorEnum.UNKNOWN
// => output: MIDWAY_10000

FrameworkErrorEnum.COMMON
// => output: MIDWAY_10001
```

这样，当错误中出现 `MIDWAY_10000` 的错误码时，我们就知道是什么错误了，配合文档就可以沉淀所有的错误。

在错误定义时，直接使用这个错误码枚举即可。

```typescript
export class MidwayParameterError extends MidwayError {
  constructor(message?: string) {
    super(message ?? 'Parameter type not match', FrameworkErrorEnum.PARAM_TYPE);
  }
}

// user code
async findAll(data) {
  if (!data.user) {
    throw new MidwayParameterError();
  }
  // ...
}

// output
// 2022-01-02 14:02:29,124 ERROR 14259 MidwayParameterError: Parameter type not match
//  		at APIController.findAll (....
//      at /Users/harry/project/midway-v3/packages/core/src/common/webGenerator.ts:38:57
//      at processTicksAndRejections (node:internal/process/task_queues:96:5) {
// 		code: 'MIDWAY_10002',
//		cause: undefined,
//	}

```





## Http 异常

在 Http 请求中，Midway 提供了更为通用的 Http 类型的异常，相比普通的异常类型，它额外包含了一个 [status ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) 状态码属性。

```typescript
export class MidwayHttpError extends MidwayError {
	// ...
}
```

我们可以在请求的过程中抛出该错误，由于错误中包含状态码，Http 程序将会自动返回该状态码。

```typescript
import { MidwayHttpError } from '@midwayjs/core';

// ...

async findAll() {
  throw new MidwayHttpError('my custom error', HttpStatus.BAD_REQUEST);
}

// got status: 400
```



如果业务有一些复用的异常，比如自定义一个状态码为 400 的 Http 异常，可以如下定义错误。

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
- `HttpVersionNotSupportedError`
- `PayloadTooLargeError`
- `UnsupportedMediaTypeError`
- `UnprocessableEntityError`
- `InternalServerError`
- `NotImplementedError`
- `ImATeapotError`
- `MethodNotAllowedError`
- `BadGatewayError`
- `ServiceUnavailableError`
- `GatewayTimeoutError`
- `PreconditionFailedError`



比如：

```typescript
import { RequestTimeoutError } from '@midwayjs/core';

// ...

async findAll() {
  // something wrong
  throw new InternalServerError();
}

// got status: 500

```



## 异常处理器

内置的异常处理器用于标准的请求响应场景，它可以捕获所有请求中抛出的错误。

通过 `@Catch` 装饰器我们可以定义某一类异常的处理程序，我们可以轻松的捕获某一类型的错误，做出处理，也可以捕获全局的错误，返回统一的格式。

比如捕获内置的错误。

```typescript
import { Catch } from '@midwayjs/decorator';
import { InternalServerErrorError} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch(InternalServerError)
export InternalServerErrorFilter {
  async catch(err: InternalServerError, ctx: Context) {
   
    // ...
    return 'got 500 error, ' + err.message;
  }
}
```



`catch` 方法的参数为当前的错误，以及当前应用该异常处理器的上下文 `Context` 。我们可以简单的将响应的数据返回。



当不传递装饰器参数时，将捕获所有的错误。

比如，捕获所有的错误，并返回特定的 JSON 结构，示例如下。

```typescript
import { Catch } from '@midwayjs/decorator';
import { MidwayHttpError } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch()
export HttpErrorFilter {
  async catch(err: MidwayHttpError, ctx: Context) {
   
    // ...
    return {
      status: err.status ?? 500,
      message: err.message;
    }
  }
  
}
```



## 使用异常处理器

定义的异常处理器只是一段普通的代码，我们还需要将它应用到我们某个框架的 app 中，比如 http 协议的 app。

我们可以在 `src/configuration.ts` 中将错误处理过滤器应用上，由于参数可以是数组，我们可以应用多个错误处理器。

```typescript
import { Configuration, App, Catch } from '@midwayjs/decorator';
import { join } from 'path';
import * as koa from '@midwayjs/koa';

@Configuration({
  imports: [
    koa
  ],
})
export class ContainerConfiguration {

  @App()
  app: koa.Application;

  async onReady() {
    this.app.useFilter([InternalServerErrorFilter, HttpErrorFilter]);
  }
}

```

使用异常处理器不需要考虑顺序，全局的错误处理器一定是最后被匹配。



## 默认的异常处理

Midway 内置了默认的异常处理行为。

如果 **没有匹配** 到异常处理器，都会被默认的异常处理器拦截，记录。

反过来说，如果自定义了异常处理器，那么错误就会被当成正常的业务逻辑，请注意，这个时候底层抛出的异常就会作为业务正常的处理逻辑，而 **不会** 被日志记录。

你可以自行在异常处理器中打印日志。

```typescript
import { Catch } from '@midwayjs/decorator';
import { InternalServerErrorError} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch(InternalServerError)
export InternalServerErrorFilter {
  async catch(err: InternalServerError, ctx: Context) {
   
    // ...
    ctx.logger.error(err);
    // ...
    return 'got 500 error, ' + err.message;
  }
}
```

