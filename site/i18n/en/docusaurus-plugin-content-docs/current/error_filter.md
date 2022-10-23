# Exception handling

Midway provides a built-in exception handler that handles all unhandled exceptions in the application. When your application code throws an exception handler, the handler catches the exception and waits for the user to handle it.

The execution position of the exception handler is behind the middleware, so it can intercept all errors thrown by the middleware and business.

![err_filter](https://img.alicdn.com/imgextra/i2/O1CN013pvSjT1nWvsLRE4vo_!!6000000005098-2-tps-2000-524.png)



## Http exception

In Http requests, Midway provides a common `MidwayHttpError` type of exception, which inherits from standard `MidwayError`.

```typescript
export class MidwayHttpError extends MidwayError {
  // ...
}
```

We can throw this error during the request. Since the error contains a status code, the Http program will automatically return the status code.

For example, the following code throws an error containing the 400 status code.

```typescript
import { MidwayHttpError } from '@midwayjs/core';

// ...

async findAll() {
  throw new MidwayHttpError('my custom error', HttpStatus.BAD_REQUEST);
}

// got status: 400
```

However, we seldom do this in general. Most business errors are reused and error messages are basically fixed. In order to reduce duplicate definitions, we can customize some exception types.

For example, to customize an Http exception with a status code of 400, you can define an error as follows.

```typescript
// src/error/custom.error.ts
import { HttpStatus } from '@midwayjs/core';

export class CustomHttpError extends MidwayHttpError {
  constructor() {
    super('my custom error', HttpStatus.BAD_REQUEST);
  }
}
```

Then throw the use in the business.

```typescript
import { CustomHttpError } from './error/custom.error';

// ...

async findAll() {
  throw new CustomHttpError();
}
```



## Exception handler

The built-in exception handler is used in standard request response scenarios and can catch errors thrown in all requests.

You can use the `@Catch` decorator to define a specific type of exception handler. You can easily catch a specific type of error and handle it. You can also catch a global error and return a unified format.

At the same time, the framework also provides some default Http errors, which are placed under the `httpError` object.

For example, capture `InternalServerErrorError` errors thrown.

We can place this type of exception handler in the `filter` directory, such as `src/filter/internal.filter.ts`.

```typescript
// src/filter/internal.filter.ts
import { Catch } from '@midwayjs/decorator';
import { httpError, MidwayHttpError } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch(httpError.InternalServerErrorError)
export class InternalServerErrorFilter {
  async catch(err: MidwayHttpError, ctx: Context) {

    // ...
    return 'got 500 error, '+ err.message;
  }
}
```

The parameters of the `catch` method are the current error and the context `Context` to which the exception handler is currently applied. We can simply return the response data.

If you do not write parameters, all errors will be captured, whether HttpError or not, and only errors thrown in the request will be captured here.

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

The defined exception handler is just a piece of common code, and we also need to apply it to the app of one of our frameworks, such as the app of http protocol.

We can apply the error handling filter in `src/configuration.ts`. Since the parameters can be arrays, we can apply multiple error processors.

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

Note that some non-Midway middleware or status codes set inside the framework cannot be intercepted because they do not use the form of error throwing. If more than 400 states are returned in the business, please use the standard form of error throwing as much as possible to facilitate the interceptor to handle.

:::



### 404 processing

Inside the framework, if there is no match to the route, a `NotFoundError` exception will be thrown. With the exception handler, we can customize its behavior.

For example, jump to a page, or return a specific result:

```typescript
// src/filter/notfound.filter.ts
import { Catch } from '@midwayjs/decorator';
import { httpError, MidwayHttpError } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch(httpError.NotFoundError)
export class NotFoundFilter {
  async catch(err: MidwayHttpError, ctx: Context) {
    // 404 error will come here
    ctx.redirect('/404.html');

    // or directly return a content
    return {
      message: '404, '+ ctx.path
    }
  }
}
```



### 500 processing

When decorator parameters are not passed, all errors will be captured.

For example, capture all errors and return a specific JSON structure, as shown in the following example.

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

We can apply the error handling filter in `src/configuration.ts`. Since the parameters can be arrays, we can apply multiple error processors.

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

There is no need to consider the order when using an exception handler. The general error handler must be matched at last, and there can only be one general error handler on an app.



## Match with Prototype

By default, exceptions only make absolute matches.

Sometimes we need to capture all derived classes, this time we need additional settings.

```typescript
import { Catch } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { MidwayError } from '@midwayjs/core';

class CustomError extends MidwayError {}

class CustomError2 extends MidwayError {}

// All subclasses will be captured here
@Catch([MidwayError], {
  matchPrototype: true
})
class TestFilter {
  catch(err, ctx) {
    // ...
  }
}
```

The configuration `matchPrototype` can match all derived classes.



## Exception log

Midway has built-in default exception handling behavior.

If the exception handler is **not matched**, it will be blocked and recorded by the exception middleware.

Conversely, if the exception handler is customized, the error will be regarded as normal business logic. Please note that the exception thrown by the bottom layer will be used as the normal processing logic of the business at this time, and **will not** be treated as normal business logic by logging.

You can print the log in the exception handler yourself.

```typescript
import { Catch } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

@Catch()
export class DefaultErrorFilter {
  async catch(err: Error, ctx: Context) {

    // ...
    ctx.logger.error(err);
    // ...
    return 'got 500 error, '+ err.message;
  }
}
```



## Built-in Http exception

The Http exceptions built into the following frameworks can be found and used in `@midwayjs/core`. Each exception already contains the default error message and status code.

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

For example:

```typescript
import { httpError } from '@midwayjs/core';

// ...

async findAll() {
  // something wrong
  throw new httpError.InternalServerErrorError();
}

// got status: 500

```

